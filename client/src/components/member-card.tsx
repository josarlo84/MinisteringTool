import { useDrag } from "react-dnd";
import { User, GripVertical } from "lucide-react";
import type { Member } from "@shared/schema";

interface MemberCardProps {
  member: Member;
}

export default function MemberCard({ member }: MemberCardProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "member",
    item: { id: member.id, type: "member", data: member },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`bg-slate-50 rounded-lg p-3 mb-3 border border-slate-200 cursor-move hover:bg-slate-100 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        isDragging ? "opacity-60 rotate-2" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
          <User className="text-slate-600 h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-slate-900 text-sm">{member.name}</p>
          <p className="text-xs text-slate-500">{member.role}</p>
        </div>
        <GripVertical className="text-slate-400 h-4 w-4" />
      </div>
    </div>
  );
}
