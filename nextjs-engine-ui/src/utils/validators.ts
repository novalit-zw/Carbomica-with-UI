export const validateFileUpload = (file: File | null): boolean => {
    if (!file) {
        return false;
    }
    const validExtensions = ['.xlsx'];
    const fileExtension = file.name.split('.').pop();
    return validExtensions.includes(`.${fileExtension}`);
};

export const validateInputData = (data: any): boolean => {
    // Implement validation logic for input data structure
    if (!data || typeof data !== 'object') {
        return false;
    }
    // Add more specific validation rules as needed
    return true;
};

export const validateScenarioName = (name: string): boolean => {
    return name.trim().length > 0;
};

export const validateOptimizationParameters = (params: any): boolean => {
    // Implement validation logic for optimization parameters
    if (!params || typeof params !== 'object') {
        return false;
    }
    // Add more specific validation rules as needed
    return true;
};