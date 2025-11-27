# Next.js Engine UI

This project is a web application built with Next.js that serves as a user interface for an existing program engine. It allows users to upload an `input_data.xlsx` file, edit variables, create custom scenarios and optimizations, and display results including graphs and tables. Additionally, it generates a PDF report of relevant data.

## Features

- **File Upload**: Users can upload an Excel file containing input data.
- **Variable Editing**: Users can edit variables used in the engine.
- **Scenario Management**: Create and manage custom scenarios for optimization.
- **Results Display**: View results in graphs and tables based on user-defined scenarios.
- **PDF Report Generation**: Generate and preview PDF reports of the results.

## Project Structure

```
nextjs-engine-ui
├── src
│   ├── app
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── upload
│   │   │   └── page.tsx
│   │   ├── editor
│   │   │   └── page.tsx
│   │   └── dashboard
│   │       └── page.tsx
│   ├── components
│   │   ├── FileUploader.tsx
│   │   ├── VariableEditor.tsx
│   │   ├── ScenarioManager.tsx
│   │   ├── OptimizationBuilder.tsx
│   │   ├── ResultsDashboard.tsx
│   │   ├── Graph.tsx
│   │   ├── DataTable.tsx
│   │   └── PDFReportPreview.tsx
│   ├── hooks
│   │   ├── useEngine.ts
│   │   └── useFileUpload.ts
│   ├── lib
│   │   ├── apiClient.ts
│   │   └── engineAdapter.ts
│   ├── services
│   │   ├── excelParser.ts
│   │   └── pdfGenerator.ts
│   ├── styles
│   │   └── globals.css
│   ├── types
│   │   └── index.ts
│   └── utils
│       └── validators.ts
├── pages
│   └── api
│       ├── upload.ts
│       ├── engine
│       │   ├── run.ts
│       │   └── status.ts
│       ├── report.ts
│       └── data.ts
├── public
│   └── fonts
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.example
└── README.md
```

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd nextjs-engine-ui
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.