import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableListProps {
  title: string;
  children: React.ReactNode;
  onSort?: (direction: "asc" | "desc") => void;
  showSort?: boolean;
}

export default function SortableList({ title, children, onSort, showSort = true }: SortableListProps) {
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  const handleSort = (direction: "asc" | "desc") => {
    setSortDirection(direction);
    onSort?.(direction);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        {showSort && (
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("asc")}
              className={`p-1 h-6 w-6 ${sortDirection === "asc" ? "bg-blue-100" : ""}`}
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSort("desc")}
              className={`p-1 h-6 w-6 ${sortDirection === "desc" ? "bg-blue-100" : ""}`}
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}