import { useDrop } from "react-dnd";
import { useState } from "react";
import { Plus, Users } from "lucide-react";

interface NewCompanionshipDropZoneProps {
  onCreateCompanionship: (data: { 
    name: string; 
    seniorCompanionId: number; 
    juniorCompanionId?: number;
    thirdCompanionId?: number;
  }) => void;
}

export default function NewCompanionshipDropZone({ onCreateCompanionship }: NewCompanionshipDropZoneProps) {
  const [droppedMembers, setDroppedMembers] = useState<any[]>([]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: "member",
    drop: (item: any) => {
      // Check if this member is already in the dropped members list
      if (droppedMembers.some(m => m.data.id === item.data.id)) {
        return;
      }
      
      // Handle the drop as "new-companionship" zone
      item.dropZone = "new-companionship";
      
      const newMembers = [...droppedMembers, item];
      setDroppedMembers(newMembers);

      if (newMembers.length === 3) {
        // Create companionship with three members
        const [senior, junior, third] = newMembers;
        const companionshipName = `${senior.data.name}, ${junior.data.name} & ${third.data.name}`;
        onCreateCompanionship({
          name: companionshipName,
          seniorCompanionId: senior.data.id,
          juniorCompanionId: junior.data.id,
          thirdCompanionId: third.data.id,
        });
        setDroppedMembers([]);
      } else if (newMembers.length === 2) {
        // Create companionship with two members after short delay to allow for third member
        setTimeout(() => {
          setDroppedMembers(current => {
            if (current.length === 2) {
              const [senior, junior] = current;
              const companionshipName = `${senior.data.name} & ${junior.data.name}`;
              onCreateCompanionship({
                name: companionshipName,
                seniorCompanionId: senior.data.id,
                juniorCompanionId: junior.data.id,
              });
              return [];
            }
            return current;
          });
        }, 1500);
      } else if (newMembers.length === 1) {
        // Create single-member companionship after longer delay to allow for more members
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
        }, 2000);
      }
    },
    canDrop: () => droppedMembers.length < 3,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <div 
      ref={drop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 min-h-[150px] flex flex-col items-center justify-center ${
        isOver && canDrop 
          ? "border-blue-400 bg-blue-100" 
          : canDrop 
          ? "border-slate-300 bg-slate-50 hover:bg-slate-100" 
          : "border-slate-200 bg-slate-50"
      }`}
    >
      {droppedMembers.length > 0 ? (
        <div className="space-y-2">
          <Users className="text-blue-500 text-2xl mb-2 mx-auto" />
          <div className="space-y-1">
            {droppedMembers.map((member, index) => (
              <p key={member.data.id} className="text-sm text-blue-600 font-medium">
                {index === 0 ? "Senior: " : index === 1 ? "Junior: " : "Third: "}
                {member.data.name}
              </p>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {droppedMembers.length === 1 
              ? "Drop another member or wait to create single companionship" 
              : droppedMembers.length === 2 
              ? "Drop another member or wait to create partnership" 
              : "Creating companionship..."}
          </p>
        </div>
      ) : (
        <>
          <Plus className="text-blue-500 text-3xl mb-3" />
          <p className="text-sm text-blue-700 font-medium">
            Drop members here to create a new companionship
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Drop 1-3 members to create a companionship
          </p>
        </>
      )}
    </div>
  );
}