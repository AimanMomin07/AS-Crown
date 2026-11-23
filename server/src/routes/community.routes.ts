import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import upload from "../middleware/community-upload.js";
import {
  listGroups,
  createGroup,
  listMembers,
  joinGroup,
  addMember,
  removeMember,
  listMessages,
  postMessage,
  toggleReaction,
  pinMessage,
  listMeetings,
  createMeeting,
  rsvpMeeting,
  listMeetingRsvps
} from "../controllers/community.controller.js";

const router = Router();
const roles = ["admin", "resident", "staff", "security", "committee"] as const;

router.get("/groups", authenticate, authorize(...roles), listGroups);
router.post("/groups", authenticate, authorize("admin"), createGroup);
router.get("/groups/:groupId/members", authenticate, authorize(...roles), listMembers);
router.post("/groups/:groupId/join", authenticate, authorize(...roles), joinGroup);
router.post("/groups/:groupId/members", authenticate, authorize("admin"), addMember);
router.delete("/groups/:groupId/members/:userId", authenticate, authorize("admin"), removeMember);
router.get("/groups/:groupId/messages", authenticate, authorize(...roles), listMessages);
router.post("/groups/:groupId/messages", authenticate, authorize(...roles), upload.single("attachment"), postMessage);
router.post("/messages/:messageId/reaction", authenticate, authorize(...roles), toggleReaction);
router.patch("/messages/:messageId/pin", authenticate, authorize("admin", "committee"), pinMessage);
router.get("/groups/:groupId/meetings", authenticate, authorize(...roles), listMeetings);
router.post("/groups/:groupId/meetings", authenticate, authorize("admin", "committee"), createMeeting);
router.post("/meetings/:meetingId/rsvp", authenticate, authorize(...roles), rsvpMeeting);
router.get("/meetings/:meetingId/rsvps", authenticate, authorize(...roles), listMeetingRsvps);

export default router;
