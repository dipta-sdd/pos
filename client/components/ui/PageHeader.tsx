import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const PageHeader = ({ title, description, children }: PageHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h1>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
    <div className="flex gap-3 items-end">
      {children}
    </div>
  </div>
);
