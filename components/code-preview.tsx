"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Download, ExternalLink, File, Folder, FolderOpen } from "lucide-react"

interface GeneratedFile {
  name: string
  content: string
}

interface CodePreviewProps {
  files: GeneratedFile[]
  onDownload?: () => void
}

export function CodePreview({ files, onDownload }: CodePreviewProps) {
    const [activeTab, setActiveTab] = useState("preview")
    const [selectedFile, setSelectedFile] = useState<string>("")
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["app", "components"]))

    // Select the initial file once the generated files are available
    useEffect(() => {
      if (files.length > 0) {
        const mainFile = files.find((f) => f.name === "app/page.tsx") || files[0]
        setSelectedFile(mainFile.name)
      }
    }, [files])

  const organizeFiles = () => {
    const structure: { [key: string]: GeneratedFile[] } = {}

    files.forEach((file) => {
      const parts = file.name.split("/")
      if (parts.length === 1) {
        // Root files
        if (!structure["root"]) structure["root"] = []
        structure["root"].push(file)
      } else {
        // Files in folders
        const folder = parts[0]
        if (!structure[folder]) structure[folder] = []
        structure[folder].push(file)
      }
    })

    return structure
  }

  const fileStructure = organizeFiles()
  const currentFile = files.find((f) => f.name === selectedFile)
  const mainPageFile = files.find((f) => f.name === "app/page.tsx")

  const toComponentName = (fileName: string) => {
    const base = fileName.split("/").pop()?.split(".")[0] || "Component"
    return base
      .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
      .replace(/^(.)/, (c) => c.toUpperCase())
  }

  const previewScripts = files
    .map((file) => {
      const componentName =
        file.name === "app/page.tsx" ? "MainComponent" : toComponentName(file.name)
      let code = file.content
      code = code.replace(/^import.*$/gm, "")
      code = code.replace(/["']use client["'];?/g, "")
      code = code.replace(
        /export\s+default\s+function\s+(\w+)/,
        `function ${componentName}`
      )
      code = code.replace(
        /export\s+default\s+/,
        `const ${componentName} = `
      )
      code = code.replace(/export\s+const\s+/g, "const ")
      code = code.replace(/export\s+function\s+/g, "function ")
      if (
        !code.includes(`function ${componentName}`) &&
        !code.includes(`const ${componentName}`)
      ) {
        code = `const ${componentName} = () => (${code});`
      }
      return `// File: ${file.name}
      (function(){
        const code = ${JSON.stringify(code)};
        const transformed = Babel.transform(code, {
          presets: ['env', 'react', 'typescript'],
          sourceType: 'script',
          parserOpts: { plugins: ['jsx', 'typescript'] }
        }).code;
        const fn = new Function('React','useState','useEffect','useRef','Image','Link','Button','Card','CardHeader','CardTitle','CardContent', transformed + '; return ${componentName};');
        window['${componentName}'] = fn(React, useState, useEffect, useRef, Image, Link, Button, Card, CardHeader, CardTitle, CardContent);
      })();`
    })
    .join("\n")

  const handleCopyCode = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content)
    }
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload()
    }
  }

  const handleDeployToVercel = () => {
    const deployUrl = `https://vercel.com/new/clone?repository-url=https://github.com/vercel/next.js/tree/canary/examples/hello-world&project-name=v0-generated-app&repository-name=v0-generated-app`
    window.open(deployUrl, "_blank")
  }

  const toggleFolder = (folder: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder)
    } else {
      newExpanded.add(folder)
    }
    setExpandedFolders(newExpanded)
  }

  if (files.length === 0) {
    return null
  }

  return (
    <Card className="h-fit">
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleCopyCode}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleDeployToVercel}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Deploy to Vercel
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="preview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="code"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
          >
            Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="p-4">
          <div className="border rounded-lg p-4 bg-white min-h-[400px]">
            {mainPageFile ? (
              <iframe
                srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    .error-container {
      color: #dc2626;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      font-family: monospace;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    const Image = (props) => React.createElement('img', {
      ...props,
      onError: (e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Image'; }
    });

    const Link = ({ href, children, ...props }) =>
      React.createElement('a', { href: href || '#', ...props }, children);

    const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
      const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors px-4 py-2 bg-blue-600 text-white hover:bg-blue-700';
      return React.createElement('button', {
        className: baseClasses + ' ' + className,
        ...props
      }, children);
    };

    const Card = ({ children, className = '', ...props }) =>
      React.createElement('div', {
        className: 'rounded-lg border bg-white shadow-sm p-6 ' + className,
        ...props
      }, children);

    const CardHeader = ({ children, className = '', ...props }) =>
      React.createElement('div', { className: 'mb-4 ' + className, ...props }, children);

    const CardTitle = ({ children, className = '', ...props }) =>
      React.createElement('h3', { className: 'text-xl font-semibold ' + className, ...props }, children);

    const CardContent = ({ children, className = '', ...props }) =>
      React.createElement('div', { className: className, ...props }, children);

    try {
      ${previewScripts}
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(window['MainComponent']));
    } catch (error) {
      console.error('Rendering error:', error);
      document.getElementById('root').innerHTML =
        '<div class="error-container"><strong>Error rendering component:</strong>\\n\\n' +
        error.message + '\\n\\nPlease check the console for more details.</div>';
    }
  </script>
</body>
</html>`}
                className="w-full h-[400px] border-0"
                title="Component Preview"
              />
            ) : (
              <div className="text-gray-500 text-center py-20">No preview available - missing app/page.tsx</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="code" className="p-0">
          <div className="flex h-[500px]">
            <div className="w-64 border-r bg-gray-50 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Files</h3>
                {Object.entries(fileStructure).map(([folder, folderFiles]) => (
                  <div key={folder} className="mb-2">
                    {folder === "root" ? (
                      // Root files
                      folderFiles.map((file) => (
                        <button
                          key={file.name}
                          onClick={() => setSelectedFile(file.name)}
                          className={`flex items-center w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-200 ${
                            selectedFile === file.name ? "bg-emerald-100 text-emerald-700" : "text-gray-700"
                          }`}
                        >
                          <File className="w-4 h-4 mr-2" />
                          {file.name}
                        </button>
                      ))
                    ) : (
                      // Folder structure
                      <div>
                        <button
                          onClick={() => toggleFolder(folder)}
                          className="flex items-center w-full text-left px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 rounded"
                        >
                          {expandedFolders.has(folder) ? (
                            <FolderOpen className="w-4 h-4 mr-2" />
                          ) : (
                            <Folder className="w-4 h-4 mr-2" />
                          )}
                          {folder}/
                        </button>
                        {expandedFolders.has(folder) && (
                          <div className="ml-4">
                            {folderFiles.map((file) => (
                              <button
                                key={file.name}
                                onClick={() => setSelectedFile(file.name)}
                                className={`flex items-center w-full text-left px-2 py-1 text-sm rounded hover:bg-gray-200 ${
                                  selectedFile === file.name ? "bg-emerald-100 text-emerald-700" : "text-gray-700"
                                }`}
                              >
                                <File className="w-4 h-4 mr-2" />
                                {file.name.split("/").pop()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {currentFile ? (
                <div className="h-full flex flex-col">
                  <div className="border-b px-4 py-2 bg-gray-50">
                    <span className="text-sm font-medium text-gray-700">{currentFile.name}</span>
                  </div>
                  <pre className="flex-1 p-4 text-sm overflow-auto bg-white">
                    <code className="language-tsx">{currentFile.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a file to view its content
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
