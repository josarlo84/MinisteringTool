import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMemberSchema, insertFamilySchema, insertCompanionshipSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Members endpoints
  app.get("/api/members", async (req, res) => {
    try {
      const members = await storage.getMembers();
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch members" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ message: "Invalid member data" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMember(id);
      res.json({ message: "Member deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete member" });
    }
  });

  // Families endpoints
  app.get("/api/families", async (req, res) => {
    try {
      const families = await storage.getFamilies();
      res.json(families);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch families" });
    }
  });

  app.post("/api/families", async (req, res) => {
    try {
      const familyData = insertFamilySchema.parse(req.body);
      const family = await storage.createFamily(familyData);
      res.json(family);
    } catch (error) {
      res.status(400).json({ message: "Invalid family data" });
    }
  });

  app.delete("/api/families/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFamily(id);
      res.json({ message: "Family deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete family" });
    }
  });

  // Companionships endpoints
  app.get("/api/companionships", async (req, res) => {
    try {
      const companionships = await storage.getAllCompanionshipsWithMembers();
      res.json(companionships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch companionships" });
    }
  });

  app.post("/api/companionships", async (req, res) => {
    try {
      const companionshipData = insertCompanionshipSchema.parse(req.body);
      const companionship = await storage.createCompanionship(companionshipData);
      res.json(companionship);
    } catch (error) {
      res.status(400).json({ message: "Invalid companionship data" });
    }
  });
  
  app.put("/api/companionships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const companionshipData = insertCompanionshipSchema.parse(req.body);
      const companionship = await storage.updateCompanionship(id, companionshipData);
      res.json(companionship);
    } catch (error) {
      res.status(400).json({ message: "Invalid companionship data" });
    }
  });

  app.delete("/api/companionships/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCompanionship(id);
      res.json({ message: "Companionship deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete companionship" });
    }
  });

  // Assignment endpoints
  app.post("/api/assign-family", async (req, res) => {
    try {
      const { familyId, companionshipId } = req.body;
      await storage.assignFamilyToCompanionship(familyId, companionshipId);
      res.json({ message: "Family assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign family" });
    }
  });

  // Change management endpoints
  app.post("/api/submit-changes", async (req, res) => {
    try {
      await storage.submitProposedChanges();
      res.json({ message: "Changes submitted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit changes" });
    }
  });

  app.post("/api/clear-proposed-changes", async (req, res) => {
    try {
      await storage.clearProposedChanges();
      res.json({ message: "Proposed changes cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear proposed changes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
