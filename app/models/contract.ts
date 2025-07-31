import prisma from '#lib/prisma'
import { Contract as ContractModel, Rights } from '@prisma/client'

export default class Contract {
  public static async getContract(id: string): Promise<ContractModel | null> {
    try {
      const contract = await prisma.contract.findUnique({
        where: {
          id: id,
        },
      })
      return contract
    } catch (error) {
      throw new Error('Failed to retrieve file list')
    }
  }

  public static async archivedContract(id: string): Promise<ContractModel | null> {
    try {
      const contract = await prisma.contract.update({
        where: { id },
        data: {
          archived_at: new Date(),
        },
      })
      return contract
    } catch (error) {
      throw new Error('Failed to archive contract')
    }
  }

  public static async getContractsByUserCompany(userId: string): Promise<Contract[]> {
    // 1. Récupère l'utilisateur avec sa team (et donc sa company via team.company_id)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        team: {
          select: { company_id: true }
        }
      }
    })

    if (!user || !user.team) {
      // pas de team → pas de société → rien à renvoyer
      return []
    }

    const companyId = user.team.company_id

    // 2. Récupère tous les utilisateurs de cette même company
    const members = await prisma.user.findMany({
      where: {
        team: { company_id: companyId },
      },
      select: { id: true },
    })
    const memberIds = members.map(m => m.id)

    if (memberIds.length === 0) {
      return []
    }

    // 3. Récupère tous les contracts liés à ces users via UserContract
    const userContracts = await prisma.userContract.findMany({
      where: {
        user_id: { in: memberIds },
      },
      select: {
        contract: true,
      },
    })

    // 4. Extraie les contrats, en supprimant les doublons
    const contracts = userContracts.map(uc => uc.contract)
    const uniqueById = new Map<string, Contract>()
    for (const c of contracts) {
      uniqueById.set(c.id, c)
    }

    return Array.from(uniqueById.values())
  }

  public static async setContractType(id: string, isIndefinite: boolean): Promise<void> {
    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      throw new Error('No contract found with the provided ID')
    }

    try {
      await prisma.contract.update({
        where: { id },
        data: {
          end_date: isIndefinite ? null : new Date(),
        },
      })
    } catch (error) {
      throw new Error('Failed to update contract type')
    }
  }

  public static async updateEndDate(id: string, endDate: Date): Promise<void> {
    try {
      await prisma.contract.update({
        where: {
          id: id,
        },
        data: {
          end_date: endDate,
        },
      })
    } catch (error) {
      throw new Error('Failed to update contract type')
    }
  }

  public static async updateStartDate(id: string, startDate: Date): Promise<void> {
    try {
      await prisma.contract.update({
        where: {
          id: id,
        },
        data: {
          end_date: startDate,
        },
      })
    } catch (error) {
      throw new Error('Failed to update contract type')
    }
  }
  public static async getParticipants(id: string): Promise<any> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
        select: {
          cocontractants: true,
          usercontracts: {
            select: {
              isSupervisor: true,
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
        },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      return contract
    } catch (error) {
      throw new Error('Failed to retrieve participants')
    }
  }

  public static async addClient(id: string, userId: string): Promise<string> {
    try {
      console.log('contrat', userId)
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }
      const userContract = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            user_id: userId,
            contract_id: id,
          },
        },
      })

      if (!userContract) {
        await prisma.userContract.create({
          data: {
            user_id: userId,
            contract_id: id,
          },
        })
      }
      return contract.title
    } catch (error) {
      throw new Error('Failed to add client to contract')
    }
  }

  public static async setSupervisor(id: string, userId: string): Promise<void> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })
      if (!contract) {
        throw new Error('Contract not found')
      }
      const userContract = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId,
          },
        },
      })
      if (!userContract) {
        await prisma.userContract.create({
          data: {
            user_id: userId,
            contract_id: id,
          },
        })
      }
      const previousSupervisor = await prisma.userContract.findFirst({
        where: {
          contract_id: id,
          isSupervisor: true,
        },
      })

      if (previousSupervisor) {
        await prisma.userContract.update({
          where: {
            user_id_contract_id: {
              contract_id: id,
              user_id: previousSupervisor.user_id,
            },
          },
          data: {
            isSupervisor: false,
          },
        })
      }
      await prisma.userContract.update({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId,
          },
        },
        data: {
          isSupervisor: true,
        },
      })
    } catch (error) {
      throw new Error('Failed to set supervision for contract')
    }
  }

  public static async isSupervisor(id: string, user_id: string): Promise<boolean> {
    try {
      const supervisor = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: user_id,
          },
          isSupervisor: true,
        },
      })

      return supervisor?.user_id === user_id
    } catch (error) {
      throw new Error('Failed to check if user is a supervisor')
    }
  }

  public static async deleteClient(id: string, clientId: string): Promise<string> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })
      if (!contract) {
        throw new Error('Contract not found')
      }

      await prisma.userContract.deleteMany({
        where: {
          contract_id: id,
          user_id: clientId,
        },
      })
      return contract.title
    } catch (error) {
      throw new Error('Failed to delete client from contract')
    }
  }

  public static async addCo(id: string, email: string): Promise<string> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      if (contract.cocontractants && contract.cocontractants.includes(email)) {
        throw new Error('Email is already a cocontractant')
      }
      await prisma.contract.update({
        where: { id },
        data: {
          cocontractants: {
            push: email,
          },
        },
      })
      return contract.title
    } catch (error) {
      throw new Error('Failed to add client to contract')
    }
  }

  public static async deleteCo(id: string, email: string): Promise<string> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })
      if (!contract) {
        throw new Error('Contract not found')
      }
      await prisma.contract.update({
        where: { id },
        data: {
          cocontractants: {
            set: contract.cocontractants.filter((co) => co !== email),
          },
        },
      })
      return contract.title
    } catch (error) {
      throw new Error('Failed to delete client from contract')
    }
  }

  public static async setRight(id: string, right: Rights): Promise<void> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      await prisma.contract.update({
        where: { id },
        data: {
          right: right,
        },
      })
    } catch (error) {
      throw new Error('Failed to set right for contract')
    }
  }

  //Validation
  public static async setValidation(id: string, userId?: string): Promise<void> {
    try {
      const userContract = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId || '',
          },
        },
      })
      if (!userContract) {
        throw new Error('User contract not found')
      }
      await prisma.userContract.update({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId || '',
          },
        },
        data: {
          isValidated: true,
        },
      })
    } catch (error) {
      throw new Error('Failed to set validation for contract')
    }
  }
  public static async unsetValidation(id: string, userId?: string): Promise<void> {
    try {
      const userContract = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId || '',
          },
        },
      })
      if (!userContract) {
        throw new Error('User contract not found')
      }
      await prisma.userContract.update({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId || '',
          },
        },
        data: {
          isValidated: false,
        },
      })
    } catch (error) {
      throw new Error('Failed to set validation for contract')
    }
  }
  public static async unsetValidations(id: string): Promise<void> {
    try {
      const usersContract = await prisma.userContract.findMany({
        where: {
          contract_id: id,
        },
      })
      if (!usersContract) {
        throw new Error('User contract not found')
      }
      for (const user of usersContract) {
        await prisma.userContract.update({
          where: {
            user_id_contract_id: {
              contract_id: id,
              user_id: user.user_id,
            },
          },
          data: {
            isValidated: false,
          },
        })
      }
      await prisma.contract.update({
        where: { id },
        data: {
          validatorCo: {
            set: [],
          },
        },
      })
    } catch (error) {
      throw new Error('Failed to set validation for contract')
    }
  }
  public static async getNumberOfValidators(id: string): Promise<number> {
    try {
      const userContracts = await prisma.userContract.findMany({
        where: {
          contract_id: id,
          isValidated: true,
        },
      })
      const contract = await prisma.contract.findUnique({
        where: { id },
      })
      const numberOfValidators = userContracts.length + (contract?.validatorCo?.length ?? 0)
      return numberOfValidators
    } catch (error) {
      throw new Error('Failed to retrieve number of validators')
    }
  }
  public static async getNumberOfParticipants(id: string): Promise<number> {
    try {
      const userContracts = await prisma.userContract.findMany({
        where: {
          contract_id: id,
        },
      })
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      return userContracts.length + (contract?.cocontractants?.length ?? 0)
    } catch (error) {
      throw new Error('Failed to retrieve number of participants')
    }
  }

  public static async isValidated(id: string, userId: string): Promise<boolean> {
    try {
      const userContract = await prisma.userContract.findUnique({
        where: {
          user_id_contract_id: {
            contract_id: id,
            user_id: userId,
          },
        },
      })

      if (!userContract) {
        throw new Error('User contract not found')
      }

      return userContract.isValidated
    } catch (error) {
      throw new Error('Failed to check if contract is validated')
    }
  }

  public static async setCoValidation(id: string, email: string): Promise<void> {
    try {
      let contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      if (contract.validatorCo && contract.validatorCo.includes(email)) {
        throw new Error('Email is already a validator')
      }

      contract = await prisma.contract.update({
        where: { id },
        data: {
          validatorCo: {
            push: email,
          },
        },
      })
    } catch (error) {
      throw new Error('Failed to set co-validation for contract')
    }
  }
  public static async unsetCoValidation(id: string, email: string): Promise<void> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      await prisma.contract.update({
        where: { id },
        data: {
          validatorCo: {
            set: contract.validatorCo.filter((co) => co !== email),
          },
        },
      })
    } catch (error) {
      throw new Error('Failed to unset co-validation for contract')
    }
  }

  public static async getCoValidation(id: string, email: string): Promise<boolean> {
    try {
      const contract = await prisma.contract.findUnique({
        where: { id },
      })

      if (!contract) {
        throw new Error('Contract not found')
      }

      const isValidated = contract.validatorCo.includes(email)
      return isValidated
    } catch (error) {
      throw new Error('Failed to get co-validation status for contract')
    }
  }
}
