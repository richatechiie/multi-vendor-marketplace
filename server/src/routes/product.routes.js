const router  = require("express").Router();
const ctrl    = require("../controllers/product.controller");
const upload  = require("../middleware/upload.middleware");
const { authenticate, authorize, requireApprovedVendor } = require("../middleware/auth.middleware");

const isApprovedVendor = [authenticate, authorize("vendor"), requireApprovedVendor];

// ── Image upload endpoint ─────────────────────────────────────────────────────
router.post(
  "/vendor/upload-image",
  ...isApprovedVendor,
  upload.single("image"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const imageUrl = `${process.env.BASE_URL || "http://localhost:5000"}/uploads/products/${req.file.filename}`;
    return res.status(200).json({ success: true, data: { imageUrl, filename: req.file.filename } });
  }
);

// ── Vendor routes FIRST — before /:slug wildcard ──────────────────────────────
router.get("/vendor/my",       ...isApprovedVendor, ctrl.getMyProducts);
router.post("/vendor/create",  ...isApprovedVendor, ctrl.createProduct);
router.put("/vendor/:uuid",    ...isApprovedVendor, ctrl.updateProduct);
router.delete("/vendor/:uuid", ...isApprovedVendor, ctrl.deleteProduct);

// ── Public routes LAST ────────────────────────────────────────────────────────
router.get("/",      ctrl.listProducts);
router.get("/:slug", ctrl.getProduct);

module.exports = router;