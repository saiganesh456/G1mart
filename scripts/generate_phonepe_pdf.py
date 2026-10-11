import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        self.saveState()
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#5f259f"))
            self.drawString(14 * mm, A4[1] - 10 * mm, "G1 MART — PHONEPE PAYMENT GATEWAY SPECIFICATION")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawRightString(A4[0] - 14 * mm, A4[1] - 10 * mm, "Domain: https://g1mart.in")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(14 * mm, A4[1] - 12 * mm, A4[0] - 14 * mm, A4[1] - 12 * mm)

            # Footer
            self.line(14 * mm, 12 * mm, A4[0] - 14 * mm, 12 * mm)
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748b"))
            self.drawString(14 * mm, 8 * mm, "Confidential — For G1 Mart Engineering & Merchant Onboarding")
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(A4[0] - 14 * mm, 8 * mm, page_text)
        self.restoreState()


def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=14 * mm,
        rightMargin=14 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm
    )

    styles = getSampleStyleSheet()

    # Custom styles
    c_primary = colors.HexColor("#5f259f")   # PhonePe Purple
    c_secondary = colors.HexColor("#1b5e20") # G1 Mart Emerald
    c_dark = colors.HexColor("#0f172a")
    c_text = colors.HexColor("#334155")
    c_bg_light = colors.HexColor("#f8fafc")
    c_purple_light = colors.HexColor("#faf5ff")
    c_border = colors.HexColor("#cbd5e1")

    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=c_dark,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_dark,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=c_text,
        leftIndent=12,
        firstLineIndent=-12,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0f172a")
    )

    th_style = ParagraphStyle(
        'TH',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=c_dark
    )

    td_style = ParagraphStyle(
        'TD',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_text
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor("#64748b")
    )

    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=c_dark
    )

    story = []

    # ================= COVER PAGE =================
    badge = Paragraph("<font color='#5f259f'><b>OFFICIAL ARCHITECTURE SPECIFICATION & KYC GUIDE</b></font>", body_style)
    story.append(badge)
    story.append(Spacer(1, 4 * mm))

    title = Paragraph("PhonePe Payment Gateway<br/><font color='#5f259f'>Integration Blueprint</font>", title_style)
    story.append(title)

    sub = Paragraph("Comprehensive Architecture, Merchant KYC, Security Protocol & Production Setup for <b>g1mart.in</b>", subtitle_style)
    story.append(sub)

    # Metadata Table
    meta_data = [
        [
            Paragraph("APPLICATION", meta_label), Paragraph("PRODUCTION DOMAIN", meta_label)
        ],
        [
            Paragraph("G1 Mart Supermarket Web App", meta_val), Paragraph("https://g1mart.in", meta_val)
        ],
        [
            Paragraph("PAYMENT GATEWAY", meta_label), Paragraph("TECH STACK", meta_label)
        ],
        [
            Paragraph("PhonePe Standard Web Checkout (PG v1)", meta_val), Paragraph("Next.js 15.3, React 19, Supabase", meta_val)
        ],
        [
            Paragraph("MERCHANT LOCATION", meta_label), Paragraph("BLUEPRINT VERSION", meta_label)
        ],
        [
            Paragraph("Padarupalli, Nellore, AP - 524004", meta_val), Paragraph("v1.0 (Production Master) — Oct 2026", meta_val)
        ],
    ]
    t_meta = Table(meta_data, colWidths=[90 * mm, 90 * mm])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 8 * mm))

    # Executive Overview
    story.append(Paragraph("<b>EXECUTIVE SUMMARY & WHY PHONEPE</b>", h2_style))
    story.append(Paragraph(
        "PhonePe is India's leading digital payments platform with over 48% market share in UPI. Integrating PhonePe Standard Checkout for <b>g1mart.in</b> provides G1 Mart customers with instant, zero-friction UPI app intent payments (PhonePe, Google Pay, Paytm, BHIM), RuPay Debit, Credit Cards, and NetBanking.",
        body_style
    ))
    story.append(Paragraph(
        "The G1 Mart codebase already contains an architecture-grade PhonePe driver at <code>src/lib/payment/phonepeAdapter.ts</code> with built-in HMAC SHA-256 (<code>X-VERIFY</code>) security, automatic paise conversion, and dual-channel verification (Server-to-Server Webhooks + Browser Order Status Polling).",
        body_style
    ))
    story.append(Spacer(1, 5 * mm))

    # Summary Checklist
    story.append(Paragraph("<b>KEY DELIVERABLES IN THIS BLUEPRINT</b>", h2_style))
    bullets = [
        "<b>Section 1: Merchant KYC & Compliance Checklist</b> — Documents needed to obtain live PhonePe credentials.",
        "<b>Section 2: Mandatory Website Compliance on g1mart.in</b> — Required policy pages (Refunds, Privacy, Terms).",
        "<b>Section 3: Production Endpoint Directory</b> — Complete routing table for APIs, webhooks, and return URLs.",
        "<b>Section 4: Technical Lifecycle Architecture</b> — 7-step sequence diagram from cart to live delivery dispatch.",
        "<b>Section 5: Cryptographic Security (X-VERIFY)</b> — Formula and code for SHA-256 checksum calculation.",
        "<b>Section 6: Code Walkthrough & Files to Update</b> — Exact file modifications to link the storefront to PhonePe.",
        "<b>Section 7: Step-by-Step Testing & Go-Live Checklist</b> — Sandbox testing to live production settlement."
    ]
    for b in bullets:
        story.append(Paragraph(f"• {b}", bullet_style))

    story.append(PageBreak())

    # ================= SECTION 1: MERCHANT KYC =================
    story.append(Paragraph("1. Merchant Account & Legal KYC Requirements", h1_style))
    story.append(Paragraph(
        "To obtain Production Live credentials (Merchant ID & Salt Key), the store owner must sign up at <b>https://business.phonepe.com</b> and submit business documents for compliance verification.",
        body_style
    ))

    kyc_table_data = [
        [Paragraph("Document", th_style), Paragraph("Requirement Details", th_style), Paragraph("Purpose / Verification", th_style)],
        [
            Paragraph("<b>GST Certificate</b>", td_style),
            Paragraph("GSTIN Registration certificate for G1 Mart Supermarket (Nellore, AP)", td_style),
            Paragraph("Legal entity verification", td_style)
        ],
        [
            Paragraph("<b>Business PAN</b>", td_style),
            Paragraph("Company PAN card (or Proprietor's PAN card for Sole Proprietorship)", td_style),
            Paragraph("RBI tax compliance & banking identity", td_style)
        ],
        [
            Paragraph("<b>Bank Account Proof</b>", td_style),
            Paragraph("Cancelled Cheque or latest 3-month Bank Statement showing Account Name, Number & IFSC", td_style),
            Paragraph("Daily automated payout settlement account (T+1 cycle)", td_style)
        ],
        [
            Paragraph("<b>Signatory KYC</b>", td_style),
            Paragraph("Aadhaar Card, Passport, or Voter ID of authorized store owner", td_style),
            Paragraph("Identity & address verification of owner", td_style)
        ],
        [
            Paragraph("<b>Storefront Photos</b>", td_style),
            Paragraph("Exterior signboard photo ('G1 Mart Supermarket'), interior aisles, and Padarupalli location", td_style),
            Paragraph("Physical merchant audit verification", td_style)
        ]
    ]
    t_kyc = Table(kyc_table_data, colWidths=[40 * mm, 80 * mm, 60 * mm])
    t_kyc.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_kyc)
    story.append(Spacer(1, 5 * mm))

    # ================= SECTION 2: WEBSITE COMPLIANCE =================
    story.append(Paragraph("2. Website Compliance Checklist on https://g1mart.in", h1_style))
    story.append(Paragraph(
        "PhonePe's risk team verifies the live website before turning on live transactions. The following information must be publicly accessible on <b>https://g1mart.in</b>:",
        body_style
    ))

    comp_data = [
        [Paragraph("Policy / Feature", th_style), Paragraph("Required Content on g1mart.in", th_style), Paragraph("Current Codebase Status", th_style)],
        [
            Paragraph("<b>Contact Us & Store Info</b>", td_style),
            Paragraph("Physical store address (Padarupalli, Nellore, AP - 524004), Phone (+91 91107 59629), Email (support@g1mart.in)", td_style),
            Paragraph("<font color='#15803d'><b>✓ Implemented</b></font> (store.ts & Footer)", td_style)
        ],
        [
            Paragraph("<b>Pricing in INR (₹)</b>", td_style),
            Paragraph("All products display clear selling prices in Indian Rupees without hidden charges", td_style),
            Paragraph("<font color='#15803d'><b>✓ Implemented</b></font> (Catalog & Cart)", td_style)
        ],
        [
            Paragraph("<b>Shipping & Delivery</b>", td_style),
            Paragraph("Estimated delivery time (15-30 mins in Nellore), serviceable 30km radius, minimum order details", td_style),
            Paragraph("<font color='#15803d'><b>✓ Implemented</b></font> (Checkout zone engine)", td_style)
        ],
        [
            Paragraph("<b>Terms & Conditions</b>", td_style),
            Paragraph("Customer user agreement, order acceptance, Nellore jurisdiction clause (Page: /terms)", td_style),
            Paragraph("<font color='#b45309'><b>⚠ Publish static page</b></font>", td_style)
        ],
        [
            Paragraph("<b>Privacy Policy</b>", td_style),
            Paragraph("User data protection, phone/address usage, statement that payment credentials are encrypted by PhonePe (Page: /privacy)", td_style),
            Paragraph("<font color='#b45309'><b>⚠ Publish static page</b></font>", td_style)
        ],
        [
            Paragraph("<b>Refund & Cancellation</b>", td_style),
            Paragraph("Cancellation permitted before order packed; refund timeline 5-7 business days via original UPI mode (Page: /refund-policy)", td_style),
            Paragraph("<font color='#b45309'><b>⚠ Publish static page</b></font>", td_style)
        ],
        [
            Paragraph("<b>SSL Security</b>", td_style),
            Paragraph("Active HTTPS on https://g1mart.in with 256-bit encryption", td_style),
            Paragraph("<font color='#15803d'><b>✓ Standard on Hosting</b></font>", td_style)
        ]
    ]
    t_comp = Table(comp_data, colWidths=[45 * mm, 85 * mm, 50 * mm])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_comp)

    story.append(PageBreak())

    # ================= SECTION 3: URL DIRECTORY =================
    story.append(Paragraph("3. Production URLs & Endpoint Directory (g1mart.in)", h1_style))
    story.append(Paragraph(
        "Below is the exact production URL mapping between customer devices, the G1 Mart Next.js application, and PhonePe servers:",
        body_style
    ))

    url_data = [
        [Paragraph("Endpoint", th_style), Paragraph("Full Production URL", th_style), Paragraph("HTTP", th_style), Paragraph("Role & Action", th_style)],
        [
            Paragraph("<b>Storefront Root</b>", td_style),
            Paragraph("<code>https://g1mart.in</code>", td_style),
            Paragraph("GET", td_style),
            Paragraph("Base website URL configured in <code>NEXT_PUBLIC_APP_URL</code>", td_style)
        ],
        [
            Paragraph("<b>Checkout Page</b>", td_style),
            Paragraph("<code>https://g1mart.in/checkout</code>", td_style),
            Paragraph("GET", td_style),
            Paragraph("Address selection, zone minimum order check", td_style)
        ],
        [
            Paragraph("<b>Payment Page</b>", td_style),
            Paragraph("<code>https://g1mart.in/payment</code>", td_style),
            Paragraph("GET", td_style),
            Paragraph("Payment selection (Pay Online vs Pay on Delivery)", td_style)
        ],
        [
            Paragraph("<b>Initiate API</b>", td_style),
            Paragraph("<code>https://g1mart.in/api/checkout/initiate</code>", td_style),
            Paragraph("POST", td_style),
            Paragraph("Calculates cart from DB, calls PhonePe <code>/pg/v1/pay</code>", td_style)
        ],
        [
            Paragraph("<b>Customer Return</b>", td_style),
            Paragraph("<code>https://g1mart.in/payment/result?orderId=...</code>", td_style),
            Paragraph("GET/POST", td_style),
            Paragraph("Redirect destination after customer completes payment on PhonePe", td_style)
        ],
        [
            Paragraph("<b>S2S Webhook</b>", td_style),
            Paragraph("<code>https://g1mart.in/api/payment/webhook</code>", td_style),
            Paragraph("POST", td_style),
            Paragraph("Server-to-server callback registered on PhonePe Merchant Portal", td_style)
        ],
        [
            Paragraph("<b>Status Poll API</b>", td_style),
            Paragraph("<code>https://g1mart.in/api/orders/{id}/payment-status</code>", td_style),
            Paragraph("GET", td_style),
            Paragraph("Polls PhonePe Order Status API (<code>/pg/v1/status/{mid}/{id}</code>)", td_style)
        ],
        [
            Paragraph("<b>Order Tracking</b>", td_style),
            Paragraph("<code>https://g1mart.in/orders/{id}?paid=true</code>", td_style),
            Paragraph("GET", td_style),
            Paragraph("Post-checkout invoice, live packing status & rider GPS track", td_style)
        ]
    ]
    t_url = Table(url_data, colWidths=[32 * mm, 78 * mm, 14 * mm, 56 * mm])
    t_url.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_url)
    story.append(Spacer(1, 4 * mm))

    story.append(Paragraph("<b>Required Environment Variables (.env.local & Production Hosting)</b>", h2_style))
    env_snippet = """# Base Application URL
NEXT_PUBLIC_APP_URL=https://g1mart.in

# PhonePe Production Credentials
PHONEPE_MERCHANT_ID=G1MARTOFFLINE
PHONEPE_SALT_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=PRODUCTION

# Optional Webhook Basic Auth (if set in PhonePe Portal)
PHONEPE_WEBHOOK_USERNAME=g1mart_s2s_user
PHONEPE_WEBHOOK_PASSWORD=g1mart_s2s_password"""
    story.append(Paragraph(f"<pre>{env_snippet}</pre>", code_style))

    # ================= SECTION 4: ARCHITECTURE & LIFECYCLE =================
    story.append(Paragraph("4. Technical Payment Lifecycle & Architecture", h1_style))
    story.append(Paragraph(
        "PhonePe integration uses a <b>Dual-Channel Settlement Pattern</b> ensuring 100% order capture even if the customer's phone disconnects:",
        body_style
    ))

    steps = [
        ("Step 1: Initiation", "Customer selects 'Pay online' and clicks checkout. The browser calls POST /api/checkout/initiate with cart items and address."),
        ("Step 2: Server Security Recalculation", "serverOrderStore recalculates item subtotal from the database. It rejects any client price manipulations. Order ID (G1-XXXXXX) and Merchant Transaction ID (MT_G1-XXXXXX_time) are assigned."),
        ("Step 3: PhonePe Pay Page API", "PhonePePaymentAdapter converts payload to Base64, computes SHA-256 X-VERIFY checksum with the Salt Key, and posts to PhonePe /pg/v1/pay. PhonePe returns a secure payment redirect URL."),
        ("Step 4: Browser Redirect to PhonePe", "The customer is seamlessly redirected to PhonePe's hosted pay page. Customer selects UPI Intent (PhonePe/GPay), UPI QR, RuPay Card, or NetBanking."),
        ("Step 5: Channel A — Server-to-Server Webhook", "PhonePe immediately fires an asynchronous POST to https://g1mart.in/api/payment/webhook. The server validates the checksum signature, checks idempotency, and updates Supabase orders.payment_status = 'completed'."),
        ("Step 6: Channel B — Return Redirect & Status Poll", "Customer browser returns to https://g1mart.in/payment/result?orderId=G1-XXXXXX. If webhook has completed, page confirms instantly. If pending, it polls /api/orders/{id}/payment-status every 2.5s."),
        ("Step 7: Real-Time Store Fulfillment", "Confirmed order broadcasts to G1 Mart store tablet and packing screen for 15-30 minute dispatch.")
    ]
    for s_title, s_desc in steps:
        story.append(Paragraph(f"<b>{s_title}</b>: {s_desc}", bullet_style))

    story.append(PageBreak())

    # ================= SECTION 5: CRYPTOGRAPHIC SECURITY =================
    story.append(Paragraph("5. Cryptographic Security (X-VERIFY Checksum)", h1_style))
    story.append(Paragraph(
        "PhonePe requires SHA-256 HMAC checksums on every request and webhook callback to prevent tampering:",
        body_style
    ))

    sec_p1 = """<b>1. Pay Page Initiation Header (POST /pg/v1/pay)</b><br/>
<code>X-VERIFY: SHA256(base64Payload + "/pg/v1/pay" + PHONEPE_SALT_KEY) + "###" + PHONEPE_SALT_INDEX</code><br/><br/>
<b>2. Order Status Polling Header (GET /pg/v1/status/{mid}/{transactionId})</b><br/>
<code>X-VERIFY: SHA256("/pg/v1/status/" + PHONEPE_MERCHANT_ID + "/" + transactionId + PHONEPE_SALT_KEY) + "###" + PHONEPE_SALT_INDEX</code><br/><br/>
<b>3. S2S Webhook Signature Verification</b><br/>
<code>calculated = SHA256(req.body.response + PHONEPE_SALT_KEY) + "###" + PHONEPE_SALT_INDEX</code><br/>
If <code>received_x_verify !== calculated</code>, the webhook is rejected with HTTP 400."""
    story.append(Paragraph(sec_p1, body_style))
    story.append(Spacer(1, 4 * mm))

    # ================= SECTION 6: CODE IMPLEMENTATION =================
    story.append(Paragraph("6. Code Walkthrough & Files to Connect", h1_style))
    story.append(Paragraph(
        "The G1 Mart codebase already has the complete PhonePe adapter built. To activate PhonePe end-to-end, update these three existing files:",
        body_style
    ))

    code_files = [
        ("1. src/app/api/checkout/initiate/route.ts",
         "Switch the payment adapter call from razorpayAdapter to phonePeAdapter. PhonePe returns redirectUrl which is passed back to the client."),
        ("2. src/app/(storefront)/payment/page.tsx",
         "When user clicks 'Pay Online' and API responds with { success: true, redirectUrl }, simply redirect the browser window: window.location.href = data.redirectUrl."),
        ("3. src/app/(storefront)/payment/result/page.tsx",
         "Page already reads ?orderId=G1-XXXXXX and polls /api/orders/[id]/payment-status. When phonePeAdapter confirms payment, it transitions to confirmed state.")
    ]
    for c_file, c_desc in code_files:
        story.append(Paragraph(f"<b>{c_file}</b>: {c_desc}", bullet_style))

    story.append(Spacer(1, 4 * mm))

    # ================= SECTION 7: TESTING & ACTIVATION =================
    story.append(Paragraph("7. Testing & Go-Live Activation Checklist", h1_style))

    test_data = [
        [Paragraph("Step", th_style), Paragraph("Action Item", th_style), Paragraph("Verification Check", th_style)],
        [
            Paragraph("<b>1. Sandbox Test</b>", td_style),
            Paragraph("Set <code>PHONEPE_MERCHANT_ID=PGTESTPAYUAT</code>, <code>PHONEPE_ENV=SANDBOX</code> in <code>.env.local</code>", td_style),
            Paragraph("API hits PhonePe UAT preprod endpoint; test transactions succeed", td_style)
        ],
        [
            Paragraph("<b>2. Merchant Portal</b>", td_style),
            Paragraph("Sign up on business.phonepe.com, submit GSTIN, Bank Proof & Aadhaar", td_style),
            Paragraph("KYC verification approved", td_style)
        ],
        [
            Paragraph("<b>3. Production Keys</b>", td_style),
            Paragraph("Generate Production Merchant ID & 32-character Salt Key in Developer Tab", td_style),
            Paragraph("Save securely in production environment", td_style)
        ],
        [
            Paragraph("<b>4. Register Webhook</b>", td_style),
            Paragraph("Enter Webhook URL: <code>https://g1mart.in/api/payment/webhook</code>", td_style),
            Paragraph("PhonePe sends test ping with HTTP 200 response", td_style)
        ],
        [
            Paragraph("<b>5. Whitelist Domain</b>", td_style),
            Paragraph("Add <code>https://g1mart.in</code> under Allowed Domains in PhonePe Portal", td_style),
            Paragraph("Domain status displays 'Approved'", td_style)
        ],
        [
            Paragraph("<b>6. Live Small Order</b>", td_style),
            Paragraph("Perform real transaction of ₹10 (e.g. soap or salt pack) using PhonePe UPI app", td_style),
            Paragraph("Order marked Paid, status updated to Order Placed, webhook returns HTTP 200", td_style)
        ],
        [
            Paragraph("<b>7. Bank Payout</b>", td_style),
            Paragraph("Verify daily settlement report on PhonePe Merchant Dashboard", td_style),
            Paragraph("Net amount credited to G1 Mart bank account (T+1 day)", td_style)
        ]
    ]
    t_test = Table(test_data, colWidths=[35 * mm, 85 * mm, 60 * mm])
    t_test.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(t_test)
    story.append(Spacer(1, 6 * mm))

    support_box = [
        [
            Paragraph(
                "<b>Official PhonePe Support Contacts</b><br/>"
                "• <b>Merchant Support Email</b>: merchant-support@phonepe.com<br/>"
                "• <b>Technical Integration Support</b>: pgsupport@phonepe.com<br/>"
                "• <b>Developer Docs</b>: https://developer.phonepe.com/v1/docs/standard-checkout-web",
                body_style
            )
        ]
    ]
    t_sup = Table(support_box, colWidths=[180 * mm])
    t_sup.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_purple_light),
        ('BOX', (0,0), (-1,-1), 1, c_primary),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(t_sup)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PhonePe PDF Guide at: {filename}")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "PHONEPE_GATEWAY_INTEGRATION_SPEC.pdf"
    build_pdf(out_path)
