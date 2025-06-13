import { useCallback, useState } from "react";
import type { Member, Family, CompanionshipWithMembers } from "@shared/schema";

interface UseDragAndDropProps {
  members: Member[];
  families: Family[];
  companionships: CompanionshipWithMembers[];
  onCreateCompanionship: (data: { 
    name: string; 
    seniorCompanionId: number; 
    juniorCompanionId?: number; 
  }) => void;
  onAssignFamily: (data: { familyId: number; companionshipId: number | null }) => void;
  isProposeMode: boolean;
}

interface DraggedMember {
  id: number;
  member: Member;
}

export function useDragAndDrop({
  members,
  families,
  companionships,
  onCreateCompanionship,
  onAssignFamily,
  isProposeMode,
}: UseDragAndDropProps) {
  
  const [draggedMembers, setDraggedMembers] = useState<DraggedMember[]>([]);
  
  const handleMemberDrop = useCallback((item: any, dropZone: string, companionshipId?: number) => {
    if (dropZone === "new-companionship" && item.type === "member") {
      // Add member to temporary collection for companionship creation
      const newDraggedMember = { id: item.data.id, member: item.data };
      const updatedDraggedMembers = [...draggedMembers, newDraggedMember];
      setDraggedMembers(updatedDraggedMembers);
      
      // If we have 2 members, create companionship
      if (updatedDraggedMembers.length >= 2) {
        const [senior, junior] = updatedDraggedMembers;
        const companionshipName = `${senior.member.name} & ${junior.member.name}`;
        onCreateCompanionship({
          name: companionshipName,
          seniorCompanionId: senior.id,
          juniorCompanionId: junior.id,
        });
        setDraggedMembers([]);
      } else if (updatedDraggedMembers.length === 1) {
        // Create single-member companionship after short delay to allow for second member
        setTimeout(() => {
          setDraggedMembers(current => {
            if (current.length === 1) {
              const companionshipName = `${current[0].member.name}'s Companionship`;
              onCreateCompanionship({
                name: companionshipName,
                seniorCompanionId: current[0].id,
              });
              return [];
            }
            return current;
          });
        }, 1000);
      }
    }
  }, [draggedMembers, onCreateCompanionship]);

  const handleFamilyDrop = useCallback((item: any, dropZone: string, companionshipId?: number) => {
    if (dropZone === "companionship" && item.type === "family" && companionshipId) {
      // Assign family to companionship
      onAssignFamily({ familyId: item.data.id, companionshipId });
    } else if (dropZone === "families" && item.type === "family") {
      // Unassign family from companionship
      onAssignFamily({ familyId: item.data.id, companionshipId: null });
    }
  }, [onAssignFamily]);

  const handleDrop = useCallback((item: any, dropZone: string, companionshipId?: number) => {
    if (item.type === "member") {
      handleMemberDrop(item, dropZone, companionshipId);
    } else if (item.type === "family") {
      handleFamilyDrop(item, dropZone, companionshipId);
    }
  }, [handleMemberDrop, handleFamilyDrop]);

  return { handleDrop, draggedMembers };
}
