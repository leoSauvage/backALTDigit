export interface WorkflowUpdates = {
    name?: string;
    description?: string;
    file_name?: string;
    template_content?: string;
    steps?: Array<any>;
    workflowfield?: Array<any>; 
  };