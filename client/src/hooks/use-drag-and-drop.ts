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
    thirdCompanionId?: number;
  }) => void;
  onUpdateCompanionship: (id: number, data: { 
    name: string; 
    seniorCompanionId: number; 
    juniorCompanionId?: number;
    thirdCompanionId?: number;
  }) => void;
  onAssignFamily: (data: { familyId: number; companionshipId: number | null }) => void;
  onRemoveMemberFromCompanionship: (companionshipId: number, memberId: number, role: string) => void;
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
  onUpdateCompanionship,
  onAssignFamily,
  onRemoveMemberFromCompanionship,
  isProposeMode,
}: UseDragAndDropProps) {
  
  const [draggedMembers, setDraggedMembers] = useState<DraggedMember[]>([]);
  
  const handleMemberDrop = useCallback((item: any, dropZone: string, companionshipId?: number) => {
    // First, handle removing a member from their original companionship if they're coming from one
    if (item.fromCompanionshipId) {
      // If the member is being dragged from a companionship
      // Remove them from the original companionship regardless of where they're being dropped
      onRemoveMemberFromCompanionship(item.fromCompanionshipId, item.data.id, item.role);
    }
    
    if (dropZone === "new-companionship" && item.type === "member") {
      // Add member to temporary collection for companionship creation
      const newDraggedMember = { id: item.data.id, member: item.data };
      
      // Check if this member is already in the dragged members list
      if (draggedMembers.some(m => m.id === newDraggedMember.id)) {
        return;
      }
      
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
    } else if (dropZone === "companionship" && item.type === "member" && companionshipId) {
      // Add member to existing companionship
      const companionship = companionships.find(comp => comp.id === companionshipId);
      if (!companionship) return;
      
      // Check if member is already in this companionship
      if (
        companionship.seniorCompanionId === item.data.id ||
        companionship.juniorCompanionId === item.data.id ||
        companionship.thirdCompanionId === item.data.id
      ) {
        return;
      }
      
      // Count existing members
      const memberCount = [
        companionship.seniorCompanion, 
        companionship.juniorCompanion, 
        companionship.thirdCompanion
      ].filter(Boolean).length;
      
      // Don't add if already at 3 members
      if (memberCount >= 3) return;
      
      // Determine which position to fill
      let updatedCompanionship = { ...companionship };
      let newName = companionship.name;
      
      if (!companionship.juniorCompanionId) {
        // Add as junior companion
        updatedCompanionship.juniorCompanionId = item.data.id;
        newName = `${companionship.seniorCompanion.name} & ${item.data.name}`;
      } else if (!companionship.thirdCompanionId) {
        // Add as third companion
        updatedCompanionship.thirdCompanionId = item.data.id;
        
        // Update name to include all three members
        if (companionship.juniorCompanion) {
          newName = `${companionship.seniorCompanion.name}, ${companionship.juniorCompanion.name} & ${item.data.name}`;
        }
      }
      
      // Update the existing companionship
      onUpdateCompanionship(companionship.id, {
        name: newName,
        seniorCompanionId: updatedCompanionship.seniorCompanionId,
        juniorCompanionId: updatedCompanionship.juniorCompanionId,
        thirdCompanionId: updatedCompanionship.thirdCompanionId,
      });
    } else if (dropZone === "members" && item.type === "member") {
      // Member is being dropped back to unassigned members
      // The removal from companionship is handled at the beginning of this function
    }
  }, [draggedMembers, onCreateCompanionship, onUpdateCompanionship, onRemoveMemberFromCompanionship, companionships]);

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
