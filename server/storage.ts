import { 
  members, 
  families, 
  companionships,
  type Member, 
  type Family, 
  type Companionship,
  type InsertMember, 
  type InsertFamily, 
  type InsertCompanionship,
  type CompanionshipWithMembers
} from "@shared/schema";

export interface IStorage {
  // Members
  getMembers(): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  deleteMember(id: number): Promise<void>;

  // Families
  getFamilies(): Promise<Family[]>;
  getFamily(id: number): Promise<Family | undefined>;
  createFamily(family: InsertFamily): Promise<Family>;
  updateFamily(id: number, updates: Partial<Family>): Promise<Family | undefined>;
  deleteFamily(id: number): Promise<void>;

  // Companionships
  getCompanionships(): Promise<Companionship[]>;
  getCompanionship(id: number): Promise<Companionship | undefined>;
  getCompanionshipWithMembers(id: number): Promise<CompanionshipWithMembers | undefined>;
  getAllCompanionshipsWithMembers(): Promise<CompanionshipWithMembers[]>;
  createCompanionship(companionship: InsertCompanionship): Promise<Companionship>;
  updateCompanionship(id: number, updates: InsertCompanionship): Promise<Companionship | undefined>;
  deleteCompanionship(id: number): Promise<void>;

  // Assignment operations
  assignFamilyToCompanionship(familyId: number, companionshipId: number | null): Promise<void>;
  submitProposedChanges(): Promise<void>;
  clearProposedChanges(): Promise<void>;
}

export class MemStorage implements IStorage {
  private members: Map<number, Member>;
  private families: Map<number, Family>;
  private companionships: Map<number, Companionship>;
  private currentMemberId: number;
  private currentFamilyId: number;
  private currentCompanionshipId: number;

  constructor() {
    this.members = new Map();
    this.families = new Map();
    this.companionships = new Map();
    this.currentMemberId = 1;
    this.currentFamilyId = 1;
    this.currentCompanionshipId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample members
    const sampleMembers: InsertMember[] = [
      { name: "Brother Johnson", role: "Elders Quorum" },
      { name: "Brother Smith", role: "Elders Quorum" },
      { name: "Brother Williams", role: "High Priests" },
      { name: "Brother Davis", role: "Elders Quorum" },
      { name: "Brother Martinez", role: "Elders Quorum" },
      { name: "Brother Thompson", role: "High Priests" },
    ];

    sampleMembers.forEach(member => {
      const id = this.currentMemberId++;
      this.members.set(id, { ...member, id });
    });

    // Sample families
    const sampleFamilies: InsertFamily[] = [
      { name: "The Anderson Family", address: "123 Maple Street", companionshipId: null },
      { name: "The Brown Family", address: "456 Oak Avenue", companionshipId: null },
      { name: "The Wilson Family", address: "789 Pine Road", companionshipId: null },
      { name: "The Martinez Family", address: "321 Cedar Lane", companionshipId: null },
      { name: "The Thompson Family", address: "654 Birch Street", companionshipId: null },
      { name: "The Garcia Family", address: "987 Elm Drive", companionshipId: null },
      { name: "The Roberts Family", address: "159 Walnut Court", companionshipId: null },
    ];

    sampleFamilies.forEach(family => {
      const id = this.currentFamilyId++;
      this.families.set(id, { ...family, id });
    });
  }

  // Members
  async getMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.currentMemberId++;
    const member: Member = { ...insertMember, id };
    this.members.set(id, member);
    return member;
  }

  async deleteMember(id: number): Promise<void> {
    this.members.delete(id);
  }

  // Families
  async getFamilies(): Promise<Family[]> {
    return Array.from(this.families.values());
  }

  async getFamily(id: number): Promise<Family | undefined> {
    return this.families.get(id);
  }

  async createFamily(insertFamily: InsertFamily): Promise<Family> {
    const id = this.currentFamilyId++;
    const family: Family = { ...insertFamily, id };
    this.families.set(id, family);
    return family;
  }

  async updateFamily(id: number, updates: Partial<Family>): Promise<Family | undefined> {
    const family = this.families.get(id);
    if (!family) return undefined;
    
    const updatedFamily = { ...family, ...updates };
    this.families.set(id, updatedFamily);
    return updatedFamily;
  }

  async deleteFamily(id: number): Promise<void> {
    this.families.delete(id);
  }

  // Companionships
  async getCompanionships(): Promise<Companionship[]> {
    return Array.from(this.companionships.values());
  }

  async getCompanionship(id: number): Promise<Companionship | undefined> {
    return this.companionships.get(id);
  }

  async getCompanionshipWithMembers(id: number): Promise<CompanionshipWithMembers | undefined> {
    const companionship = this.companionships.get(id);
    if (!companionship) return undefined;

    const seniorCompanion = this.members.get(companionship.seniorCompanionId);
    const juniorCompanion = companionship.juniorCompanionId 
      ? this.members.get(companionship.juniorCompanionId) 
      : undefined;
    const thirdCompanion = companionship.thirdCompanionId
      ? this.members.get(companionship.thirdCompanionId)
      : undefined;
    
    if (!seniorCompanion) return undefined;

    const assignedFamilies = Array.from(this.families.values())
      .filter(family => family.companionshipId === id);

    return {
      ...companionship,
      seniorCompanion,
      juniorCompanion,
      thirdCompanion,
      assignedFamilies,
    };
  }

  async getAllCompanionshipsWithMembers(): Promise<CompanionshipWithMembers[]> {
    const companionships = Array.from(this.companionships.values());
    const result: CompanionshipWithMembers[] = [];

    for (const companionship of companionships) {
      const withMembers = await this.getCompanionshipWithMembers(companionship.id);
      if (withMembers) {
        result.push(withMembers);
      }
    }

    return result;
  }

  async createCompanionship(insertCompanionship: InsertCompanionship): Promise<Companionship> {
    const id = this.currentCompanionshipId++;
    const companionship: Companionship = { ...insertCompanionship, id };
    this.companionships.set(id, companionship);
    return companionship;
  }
  
  async updateCompanionship(id: number, updates: InsertCompanionship): Promise<Companionship | undefined> {
    const companionship = this.companionships.get(id);
    if (!companionship) return undefined;
    
    const updatedCompanionship = { ...companionship, ...updates };
    this.companionships.set(id, updatedCompanionship);
    return updatedCompanionship;
  }

  async deleteCompanionship(id: number): Promise<void> {
    // Unassign all families from this companionship
    const families = Array.from(this.families.values());
    families.forEach(family => {
      if (family.companionshipId === id) {
        this.families.set(family.id, { ...family, companionshipId: null });
      }
    });

    this.companionships.delete(id);
  }

  // Assignment operations
  async assignFamilyToCompanionship(familyId: number, companionshipId: number | null): Promise<void> {
    const family = this.families.get(familyId);
    if (!family) return;

    this.families.set(familyId, { ...family, companionshipId });
  }

  async submitProposedChanges(): Promise<void> {
    // Convert all proposed companionships to permanent
    const companionships = Array.from(this.companionships.values());
    companionships.forEach(companionship => {
      if (companionship.isProposed) {
        this.companionships.set(companionship.id, {
          ...companionship,
          isProposed: false,
        });
      }
    });
  }

  async clearProposedChanges(): Promise<void> {
    // Remove all proposed companionships and their family assignments
    const companionships = Array.from(this.companionships.values());
    companionships.forEach(companionship => {
      if (companionship.isProposed) {
        // Unassign families
        const families = Array.from(this.families.values());
        families.forEach(family => {
          if (family.companionshipId === companionship.id) {
            this.families.set(family.id, { ...family, companionshipId: null });
          }
        });
        
        // Delete companionship
        this.companionships.delete(companionship.id);
      }
    });
  }
}

export const storage = new MemStorage();
