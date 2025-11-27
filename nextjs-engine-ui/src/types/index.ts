// src/types/index.ts

export interface UploadResponse {
    success: boolean;
    message: string;
    filePath?: string;
}

export interface Variable {
    name: string;
    value: number | string;
}

export interface Scenario {
    id: string;
    name: string;
    variables: Variable[];
}

export interface Optimization {
    id: string;
    name: string;
    parameters: Record<string, any>;
}

export interface Result {
    scenarioId: string;
    data: any; // Replace 'any' with a more specific type based on your data structure
}

export interface PDFReport {
    title: string;
    content: string;
    generatedAt: Date;
}