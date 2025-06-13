import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, FileText, Edit, Check, Plus, Info } from "lucide-react";
import MemberCard from "@/components/member-card";
import FamilyCard from "@/components/family-card";
import CompanionshipCard from "@/components/companionship-card";
import ReportModal from "@/components/report-modal";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import type { Member, Family, CompanionshipWithMembers } from "@shared/schema";

export default function MinisteringDashboard() {
  const { toast } = useToast();
  const [isProposeMode, setIsProposeMode] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddFamilyOpen, setIsAddFamilyOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "" });
  const [newFamily, setNewFamily] = useState({ name: "", address: "" });

  const { data: members = [], isLoading: membersLoading } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });

  const { data: families = [], isLoading: familiesLoading } = useQuery<Family[]>({
    queryKey: ["/api/families"],
  });

  const { data: companionships = [], isLoading: companionshipsLoading } = useQuery<CompanionshipWithMembers[]>({
    queryKey: ["/api/companionships"],
  });

  const createMemberMutation = useMutation({
    mutationFn: (memberData: { name: string; role: string }) =>
      apiRequest("POST", "/api/members", memberData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      setIsAddMemberOpen(false);
      setNewMember({ name: "", role: "" });
      toast({ title: "Member added successfully" });
    },
  });

  const createFamilyMutation = useMutation({
    mutationFn: (familyData: { name: string; address: string }) =>
      apiRequest("POST", "/api/families", { ...familyData, companionshipId: null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      setIsAddFamilyOpen(false);
      setNewFamily({ name: "", address: "" });
      toast({ title: "Family added successfully" });
    },
  });

  const createCompanionshipMutation = useMutation({
    mutationFn: (companionshipData: { name: string; seniorCompanionId: number; juniorCompanionId?: number }) =>
      apiRequest("POST", "/api/companionships", { ...companionshipData, isProposed: isProposeMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companionships"] });
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      toast({ title: "Companionship created successfully" });
    },
  });

  const assignFamilyMutation = useMutation({
    mutationFn: ({ familyId, companionshipId }: { familyId: number; companionshipId: number | null }) =>
      apiRequest("POST", "/api/assign-family", { familyId, companionshipId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/families"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companionships"] });
      toast({ title: "Family assignment updated" });
    },
  });

  const submitChangesMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/submit-changes"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companionships"] });
      setIsProposeMode(false);
      toast({ title: "Changes submitted for approval" });
    },
  });

  const { handleDrop } = useDragAndDrop({
    members,
    families,
    companionships,
    onCreateCompanionship: createCompanionshipMutation.mutate,
    onAssignFamily: assignFamilyMutation.mutate,
    isProposeMode,
  });

  const unassignedMembers = members.filter(member => 
    !companionships.some(comp => 
      comp.seniorCompanionId === member.id || comp.juniorCompanionId === member.id
    )
  );

  const unassignedFamilies = families.filter(family => !family.companionshipId);

  const proposedChangesCount = companionships.filter(comp => comp.isProposed).length;

  const handleAddMember = () => {
    if (newMember.name && newMember.role) {
      createMemberMutation.mutate(newMember);
    }
  };

  const handleAddFamily = () => {
    if (newFamily.name && newFamily.address) {
      createFamilyMutation.mutate(newFamily);
    }
  };

  if (membersLoading || familiesLoading || companionshipsLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ministering data...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Users className="text-primary text-xl" />
                <h1 className="text-xl font-semibold text-slate-900">Ministering Assignment Manager</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReportOpen(true)}
                  className="text-slate-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
                <Button 
                  onClick={() => setIsProposeMode(!isProposeMode)}
                  variant={isProposeMode ? "secondary" : "default"}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {isProposeMode ? "Exit Propose" : "Propose Changes"}
                </Button>
                <Button 
                  onClick={() => submitChangesMutation.mutate()}
                  disabled={proposedChangesCount === 0}
                  className="bg-secondary hover:bg-emerald-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Submit Changes
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Status Banner */}
        {isProposeMode && (
          <div className="bg-blue-50 border-l-4 border-primary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center">
                <Info className="text-primary mr-3 h-4 w-4" />
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Propose Mode:</span> Changes are temporary until submitted for Bishop approval.
                  {proposedChangesCount > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {proposedChangesCount} pending changes
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Unassigned Members Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Users className="text-slate-400 mr-2 h-5 w-5" />
                    Unassigned Members
                  </h2>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium">
                    {unassignedMembers.length}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Drag members to create companionships</p>
              </div>
              
              <div 
                className="p-4 min-h-[200px]"
                onDrop={(e) => handleDrop(e, "unassigned")}
                onDragOver={(e) => e.preventDefault()}
              >
                {unassignedMembers.map(member => (
                  <MemberCard key={member.id} member={member} />
                ))}
              </div>

              <div className="p-4 border-t border-slate-200">
                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Member</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="memberName">Name</Label>
                        <Input
                          id="memberName"
                          value={newMember.name}
                          onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Brother Smith"
                        />
                      </div>
                      <div>
                        <Label htmlFor="memberRole">Role</Label>
                        <Select onValueChange={(value) => setNewMember(prev => ({ ...prev, role: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Elders Quorum">Elders Quorum</SelectItem>
                            <SelectItem value="High Priests">High Priests</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddMember} className="w-full">
                        Add Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Ministering Companionships Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Users className="text-blue-500 mr-2 h-5 w-5" />
                    Ministering Companionships
                  </h2>
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                    {companionships.length}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Drag families here to assign visits</p>
              </div>
              
              <div className="p-4 space-y-4">
                {companionships.map(companionship => (
                  <CompanionshipCard 
                    key={companionship.id} 
                    companionship={companionship}
                    onDrop={handleDrop}
                  />
                ))}

                {/* Create New Companionship Drop Zone */}
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition-colors duration-200 min-h-[100px] flex flex-col items-center justify-center"
                  onDrop={(e) => handleDrop(e, "new-companionship")}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Plus className="text-slate-400 text-2xl mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Drop two members here to create a new companionship</p>
                </div>
              </div>
            </div>

            {/* Families Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Users className="text-green-500 mr-2 h-5 w-5" />
                    Families
                  </h2>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                    {families.length}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Drag families to assign to companionships</p>
              </div>
              
              <div 
                className="p-4 min-h-[200px]"
                onDrop={(e) => handleDrop(e, "families")}
                onDragOver={(e) => e.preventDefault()}
              >
                {unassignedFamilies.map(family => (
                  <FamilyCard key={family.id} family={family} />
                ))}
              </div>

              <div className="p-4 border-t border-slate-200">
                <Dialog open={isAddFamilyOpen} onOpenChange={setIsAddFamilyOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full bg-green-100 hover:bg-green-200 text-green-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Family
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Family</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="familyName">Family Name</Label>
                        <Input
                          id="familyName"
                          value={newFamily.name}
                          onChange={(e) => setNewFamily(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="The Smith Family"
                        />
                      </div>
                      <div>
                        <Label htmlFor="familyAddress">Address</Label>
                        <Input
                          id="familyAddress"
                          value={newFamily.address}
                          onChange={(e) => setNewFamily(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main Street"
                        />
                      </div>
                      <Button onClick={handleAddFamily} className="w-full">
                        Add Family
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </main>

        <ReportModal 
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          companionships={companionships}
          members={members}
          families={families}
        />
      </div>
    </DndProvider>
  );
}
