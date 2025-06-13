import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, PrinterCheck, Mail, X } from "lucide-react";
import type { CompanionshipWithMembers, Member, Family } from "@shared/schema";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  companionships: CompanionshipWithMembers[];
  members: Member[];
  families: Family[];
}

export default function ReportModal({ 
  isOpen, 
  onClose, 
  companionships, 
  members, 
  families 
}: ReportModalProps) {
  const proposedCompanionships = companionships.filter(comp => comp.isProposed);
  const newAssignments = families.filter(family => 
    family.companionshipId && 
    companionships.find(comp => comp.id === family.companionshipId)?.isProposed
  );

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Ministering Assignment Changes for Approval");
    const body = encodeURIComponent(`Please review the attached ministering assignment changes.

New Companionships: ${proposedCompanionships.length}
New Family Assignments: ${newAssignments.length}

Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`);
    
    window.open(`mailto:bishop@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center">
              <FileText className="text-primary mr-3 h-5 w-5" />
              Ministering Assignment Report
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-slate-500">Proposed changes for Bishop approval</p>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-96 space-y-6">
          {proposedCompanionships.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-3">New Companionships</h3>
              <div className="space-y-2">
                {proposedCompanionships.map(comp => (
                  <div key={comp.id} className="flex items-center justify-between bg-white rounded-md p-3">
                    <div>
                      <p className="font-medium text-slate-900">{comp.name}</p>
                      <p className="text-sm text-slate-600">
                        {comp.seniorCompanion.name} (Senior)
                        {comp.juniorCompanion && ` & ${comp.juniorCompanion.name}`}
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newAssignments.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">Family Assignments</h3>
              <div className="space-y-2">
                {newAssignments.map(family => {
                  const companionship = companionships.find(comp => comp.id === family.companionshipId);
                  return (
                    <div key={family.id} className="flex items-center justify-between bg-white rounded-md p-3">
                      <div>
                        <p className="font-medium text-slate-900">{family.name}</p>
                        <p className="text-sm text-slate-600">
                          Assigned to {companionship?.name}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        New
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {proposedCompanionships.length === 0 && newAssignments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500">No proposed changes to report.</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-slate-200 bg-slate-50 p-6 -m-6 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handlePrint}>
                <PrinterCheck className="mr-2 h-4 w-4" />
                PrinterCheck
              </Button>
              <Button onClick={handleEmail}>
                <Mail className="mr-2 h-4 w-4" />
                Email to Bishop
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
