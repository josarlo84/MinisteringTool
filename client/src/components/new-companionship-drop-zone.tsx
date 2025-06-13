import { useDrop } from "react-dnd";
import { useState } from "react";
import { Plus, Users } from "lucide-react";

interface NewCompanionshipDropZoneProps {
  onCreateCompanionship: (data: { 
    name: string; 
    seniorCompanionId: number; 
    juniorCompanionId?: number; 
  }) => void;
}

export default function NewCompanionshipDropZone({ onCreateCompanionship }: NewCompanionshipDropZoneProps) {
  const [droppedMembers, setDroppedMembers] = useState<any[]>([]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "member",
    drop: (item: any) => {
      const newMembers = [...droppedMembers, item];
      setDroppedMembers(newMembers);

      if (newMembers.length >= 2) {
        const [senior, junior] = newMembers;
        const companionshipName = `${senior.data.name} & ${junior.data.name}`;
        onCreateCompanionship({
          name: companionshipName,
          seniorCompanionId: senior.data.id,
          juniorCompanionId: junior.data.id,
        });
        setDroppedMembers([]);
      } else if (newMembers.length === 1) {
        // Create single-member companionship after delay
        setTimeout(() => {
          setDroppedMembers(current => {
            if (current.length === 1) {
              const companionshipName = `${current[0].data.name}'s Companionship`;
              onCreateCompanionship({
                name: companionshipName,
                seniorCompanionId: current[0].data.id,
              });
              return [];
            }
            return current;
          });
        }, 1500);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div 
      ref={drop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 min-h-[100px] flex flex-col items-center justify-center ${
        isOver && canDrop 
          ? "border-blue-400 bg-blue-100" 
          : canDrop 
          ? "border-slate-300 bg-slate-50 hover:bg-slate-100" 
          : "border-slate-200 bg-slate-25"
      }`}
    >
      {droppedMembers.length > 0 ? (
        <div className="space-y-2">
          <Users className="text-blue-500 text-2xl mb-2 mx-auto" />
          <p className="text-sm text-blue-600 font-medium">
            {droppedMembers[0].data.name} selected
          </p>
          <p className="text-xs text-slate-500">
            Drop another member or wait to create single companionship
          </p>
        </div>
      ) : (
        <>
          <Plus className="text-slate-400 text-2xl mb-2" />
          <p className="text-sm text-slate-500 font-medium">
            Drop members here to create a new companionship
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Drop 1 member for single, 2 members for partnership
          </p>
        </>
      )}
    </div>
  );
}