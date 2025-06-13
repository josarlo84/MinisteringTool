import { useDrag } from "react-dnd";
import { Home, GripVertical } from "lucide-react";
import type { Family } from "@shared/schema";

interface FamilyCardProps {
  family: Family;
}

export default function FamilyCard({ family }: FamilyCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "family",
    item: { id: family.id, type: "family", data: family },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-green-50 rounded-lg p-3 mb-3 border border-green-200 cursor-move hover:bg-green-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isDragging ? "opacity-60 rotate-2" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-green-300 rounded-full flex items-center justify-center">
          <Home className="text-green-700 h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-green-900 text-sm">{family.name}</p>
          <p className="text-xs text-green-600">{family.address}</p>
          <p className="text-xs text-green-500">
            {family.companionshipId ? "Assigned" : "Unassigned"}
          </p>
        </div>
        <GripVertical className="text-green-400 h-4 w-4" />
      </div>
    </div>
  );
}
