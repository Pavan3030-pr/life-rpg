import { Router, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin.js";

const router = Router();

async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing authentication token.",
      });
    }

    const token = header.replace("Bearer ", "").trim();

    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    res.locals.userId = user.id;

    next();
  } catch {
    return res.status(401).json({
      message: "Authentication failed.",
    });
  }
}

router.post("/complete", requireAuth, async (req, res) => {
  try {
    const { questId } = req.body;
    const userId = res.locals.userId as string;

    if (!questId) {
      return res.status(400).json({
        message: "questId is required.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "complete_quest",
      {
        p_quest_id: questId,
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("QUEST COMPLETION ERROR:", error);

      if (error.message === "Quest not found") {
        return res.status(404).json({
          message: "Quest not found.",
        });
      }

      if (error.message === "Quest is already completed or inactive") {
        return res.status(400).json({
          message: "Quest is already completed or inactive.",
        });
      }

      return res.status(500).json({
        message: "Failed to complete quest.",
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("QUEST COMPLETION SERVER ERROR:", error);

    return res.status(500).json({
      message: "Failed to complete quest.",
    });
  }
});


router.post("/purchase", requireAuth, async (req, res) => {
  try {
    const { itemKey } = req.body;
    const userId = res.locals.userId as string;

    if (!itemKey) {
      return res.status(400).json({
        message: "itemKey is required.",
      });
    }

    const { data, error } = await supabaseAdmin.rpc(
      "purchase_item",
      {
        p_item_key: itemKey,
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("PURCHASE ERROR:", error);

      if (error.message === "Item not found") {
        return res.status(404).json({
          message: "Item not found.",
        });
      }

      if (error.message === "Not enough gold") {
        return res.status(400).json({
          message: "Not enough gold.",
        });
      }

      return res.status(500).json({
        message: "Failed to purchase item.",
      });
    }

    return res.json(data);
  } catch (error) {
    console.error("PURCHASE SERVER ERROR:", error);

    return res.status(500).json({
      message: "Failed to purchase item.",
    });
  }
});

export default router;