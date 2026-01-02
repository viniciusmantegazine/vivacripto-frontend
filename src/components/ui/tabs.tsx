import React, { useState } from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className = "",
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, {
              activeTab: value,
              onTabChange: onValueChange,
            })
          : child
      )}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`flex border-b border-gray-200 mb-6 ${className}`}
    role="tablist"
  >
    {children}
  </div>
);

export const TabsTrigger: React.FC<
  TabsTriggerProps & { activeTab?: string; onTabChange?: (value: string) => void }
> = ({ value, children, className = "", activeTab, onTabChange }) => (
  <button
    onClick={() => onTabChange?.(value)}
    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
      activeTab === value
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-600 hover:text-gray-900"
    } ${className}`}
    role="tab"
    aria-selected={activeTab === value}
  >
    {children}
  </button>
);

export const TabsContent: React.FC<
  TabsContentProps & { activeTab?: string }
> = ({ value, children, className = "", activeTab }) =>
  activeTab === value ? (
    <div className={className} role="tabpanel">
      {children}
    </div>
  ) : null;
