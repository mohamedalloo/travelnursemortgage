/* TravelNurseMortgage match form — one big friendly question per screen.
   Leads insert into the shared AdaptLend Supabase `leads` table (insert-only RLS). */

const SUPABASE_URL = "https://jaqtpjsnnsyxispgyzya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sXx0Rk_xOE6UmULnzQ94LA_ZdsWRnYW"; // publishable key — safe to expose; RLS is insert-only

const overlay = document.getElementById("formOverlay");
const formBody = document.getElementById("formBody");
const progressBar = document.getElementById("progressBar");

const answers = {
  goal: "", property: "primary", amount: "", income: "", docs: "", credit: "",
};

/* Loan-product matching: first rule that fits wins. Delivered to the broker,
   never shown on-screen. "— RetiredRefi" suffix attributes the lead source. */
const MATCH_RULES = [
  { match: (a) => a.income === "1099", name: "1099 / Bank Statement Loan" },
  { match: (a) => a.credit === "event", name: "Fresh Start Loan" },
  { match: () => true, name: "Travel Nurse Income Mortgage" },
];
function matchedProduct() {
  return MATCH_RULES.find((r) => r.match(answers)).name + " — TravelNurseMortgage";
}

/* ---------- Steps ---------- */

const STEPS = [
  {
    key: "goal",
    question: "What would you like to do?",
    help: "There's no wrong answer — this just points us in the right direction.",
    choices: [
      { value: "first", label: "Buy my first home", sub: "Finally — a home base between contracts" },
      { value: "buy", label: "Buy a home", sub: "Moving up, relocating, or investing" },
      { value: "refi", label: "Refinance", sub: "Better rate or cash out" },
      { value: "explore", label: "Just seeing what I qualify for", sub: "No pressure, real numbers" },
    ],
  },
  {
    key: "income",
    question: "How are you paid right now?",
    help: "Pick the closest fit — mixes are normal in travel nursing.",
    choices: [
      { value: "agency-w2", label: "Agency W-2 travel contracts", sub: "Base pay plus stipends" },
      { value: "1099", label: "1099 contracts", sub: "Paid as an independent contractor" },
      { value: "staff-w2", label: "Staff W-2", sub: "Hospital or clinic, maybe with OT and differentials" },
      { value: "mixed", label: "A mix", sub: "Some W-2, some 1099, some per-diem" },
    ],
  },
  {
    key: "amount",
    question: "Roughly what price range are you looking at?",
    help: "Your best guess is plenty.",
    choices: [
      { value: "under300", label: "Under $300,000" },
      { value: "300to600", label: "$300,000 – $600,000" },
      { value: "600to1m", label: "$600,000 – $1 million" },
      { value: "jumbo", label: "Over $1 million" },
    ],
  },
  {
    key: "docs",
    question: "How long have you been working this way?",
    help: "Lenders care about history more than anything else.",
    choices: [
      { value: "under-1yr", label: "Under a year" },
      { value: "1-2yrs", label: "1–2 years" },
      { value: "2plus-yrs", label: "More than 2 years" },
    ],
  },
  {
    key: "credit",
    question: "How's your credit been lately?",
    help: "This never touches your credit report — it's just your own sense of it.",
    choices: [
      { value: "great", label: "Very good or excellent" },
      { value: "good", label: "Good" },
      { value: "fair", label: "Fair — a few dings" },
      { value: "event", label: "A rough patch", sub: "Bankruptcy, foreclosure, or big late payments" },
    ],
  },
];

const CONTACT_STEP = STEPS.length; // contact form is the final step
let stepIndex = 0;

/* ---------- Rendering ---------- */

function setProgress() {
  const pct = Math.round((stepIndex / (STEPS.length + 1)) * 100);
  progressBar.style.width = pct + "%";
}

function renderStep() {
  setProgress();
  if (stepIndex < STEPS.length) return renderChoice(STEPS[stepIndex]);
  renderContact();
}

function renderChoice(step) {
  const choices = step.choices
    .map(
      (c) => `<button class="choice-btn" data-value="${c.value}">${c.label}${
        c.sub ? `<span class="choice-sub">${c.sub}</span>` : ""
      }</button>`
    )
    .join("");
  formBody.innerHTML = `
    <div class="form-step">
      <h2 id="formQuestion">${step.question}</h2>
      ${step.help ? `<p class="step-help">${step.help}</p>` : ""}
      <div class="choice-list">${choices}</div>
      ${stepIndex > 0 ? '<div class="form-nav"><button class="btn-back" data-back>&larr; Back</button></div>' : ""}
    </div>`;
  formBody.querySelectorAll(".choice-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      answers[step.key] = btn.dataset.value;
      stepIndex++;
      renderStep();
    })
  );
  const back = formBody.querySelector("[data-back]");
  if (back) back.addEventListener("click", () => { stepIndex--; renderStep(); });
}

const US_STATES = "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" ");

function renderContact() {
  formBody.innerHTML = `
    <div class="form-step">
      <h2 id="formQuestion">Last step — where should your specialist reach you?</h2>
      <p class="step-help">A licensed professional reviews your answers personally and reaches out within one business day.</p>
      <div class="field-row">
        <div class="field"><label for="f_first">Legal first name</label><input type="text" id="f_first" autocomplete="given-name"></div>
        <div class="field"><label for="f_last">Legal last name</label><input type="text" id="f_last" autocomplete="family-name"></div>
      </div>
      <div class="field"><label for="f_email">Email</label><input type="email" id="f_email" autocomplete="email"></div>
      <div class="field-row">
        <div class="field"><label for="f_phone">Phone</label><input type="tel" id="f_phone" autocomplete="tel"></div>
        <div class="field"><label for="f_dob">Date of birth <span style="font-weight:400">(needed for verification)</span></label><input type="date" id="f_dob" autocomplete="bday"></div>
      </div>
      <div class="field-row">
        <div class="field" style="grid-column:1/-1"><label for="f_street">Street address</label><input type="text" id="f_street" autocomplete="street-address"></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="f_unit">Apt / Unit <span style="font-weight:400">(optional)</span></label><input type="text" id="f_unit"></div>
        <div class="field"><label for="f_city">City</label><input type="text" id="f_city" autocomplete="address-level2"></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="f_state">State</label><select id="f_state"><option value="">Select…</option>${US_STATES.map((s) => `<option>${s}</option>`).join("")}</select></div>
        <div class="field"><label for="f_zip">ZIP code</label><input type="text" id="f_zip" inputmode="numeric" autocomplete="postal-code"></div>
      </div>
      <label class="consent">
        <input type="checkbox" id="f_consent">
        <span>I agree to the <a href="https://adaptlend.com/terms.html" target="_blank" rel="noopener">Terms of Use</a> and
        <a href="https://adaptlend.com/privacy.html" target="_blank" rel="noopener">Privacy Policy</a>, and I expressly consent to
        AdaptLend and its participating professionals contacting me about my inquiry by phone, text message, and email —
        including automated dialing systems, prerecorded messages, and texts — at the number and address I provided.
        I understand consent is not a condition of receiving any loan or service, message and data rates may apply,
        and I can opt out anytime (reply STOP to texts).</span>
      </label>
      <p class="form-error" id="formError"></p>
      <div class="form-nav">
        <button class="btn-back" data-back>&larr; Back</button>
        <button class="btn btn-primary btn-lg" id="submitBtn">See my options</button>
      </div>
    </div>`;
  formBody.querySelector("[data-back]").addEventListener("click", () => { stepIndex--; renderStep(); });
  formBody.querySelector("#submitBtn").addEventListener("click", submitLead);
}

/* ---------- Validation & submit ---------- */

function val(id) { return document.getElementById(id).value.trim(); }

function validate() {
  const need = { f_first: "first name", f_last: "last name", f_email: "email", f_phone: "phone", f_dob: "date of birth", f_street: "street address", f_city: "city", f_state: "state", f_zip: "ZIP code" };
  for (const [id, label] of Object.entries(need)) {
    if (!val(id)) return `Please add your ${label}.`;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val("f_email"))) return "That email doesn't look complete.";
  if (val("f_phone").replace(/\D/g, "").length < 10) return "Please use a 10-digit phone number.";
  if (!/^\d{5}(-\d{4})?$/.test(val("f_zip"))) return "ZIP code should be 5 digits.";
  const dob = new Date(val("f_dob"));
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (!(age >= 18 && age < 125)) return "Please double-check the date of birth.";
  if (!document.getElementById("f_consent").checked) return "Please check the consent box so a specialist may contact you.";
  return null;
}

async function submitLead() {
  const err = validate();
  const errEl = document.getElementById("formError");
  if (err) { errEl.textContent = err; return; }
  errEl.textContent = "";
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "One moment…";

  const lead = {
    goal: answers.goal,
    income: answers.income,
    docs: answers.docs || null,
    credit: answers.credit,
    property: answers.property,
    amount: answers.amount,
    matched_product: matchedProduct(),
    first_name: val("f_first"),
    last_name: val("f_last"),
    email: val("f_email"),
    phone: val("f_phone"),
    dob: val("f_dob"),
    street: val("f_street"),
    unit: val("f_unit") || null,
    city: val("f_city"),
    state: val("f_state"),
    zip: val("f_zip"),
    tcpa_consent: true,
  };

  let ok = false;
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify(lead),
      });
      ok = res.ok;
      if (!res.ok) console.error("Supabase insert failed:", res.status, await res.text());
    } catch (e) {
      console.error("Supabase insert error:", e);
    }
  } else {
    console.warn("Supabase not configured; lead logged to console only.", lead);
    ok = true;
  }

  if (!ok) {
    errEl.textContent = "Something went wrong on our end — please try again in a moment.";
    btn.disabled = false;
    btn.textContent = "See my options";
    return;
  }
  renderSuccess();
}

function renderSuccess() {
  progressBar.style.width = "100%";
  formBody.innerHTML = `
    <div class="form-success">
      <div class="success-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h2>You're all set.</h2>
      <p>A licensed specialist who works with retirees is reviewing your answers and will reach out within one business day.</p>
      <p>We've also sent a note to your email — if you don't see it, check the spam folder just in case.</p>
      <button class="btn btn-primary" data-close-form>Done</button>
    </div>`;
  formBody.querySelector("[data-close-form]").addEventListener("click", closeForm);
}

/* ---------- Open / close ---------- */

function openForm(goal) {
  if (goal) answers.goal = goal;
  stepIndex = goal ? 1 : 0; // goal cards skip the first question
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  renderStep();
}
function closeForm() {
  overlay.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-open-form]").forEach((el) =>
  el.addEventListener("click", () => openForm(el.dataset.goal || ""))
);
overlay.querySelector("[data-close-form]").addEventListener("click", closeForm);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) closeForm();
});

/* ---------- Asset-depletion mini calculator ---------- */

const calcInput = document.getElementById("calcAssets");
if (calcInput) {
  calcInput.addEventListener("input", () => {
    const digits = calcInput.value.replace(/[^\d]/g, "");
    calcInput.value = digits ? Number(digits).toLocaleString("en-US") : "";
    const assets = Number(digits || 0);
    const result = document.getElementById("calcResult");
    if (assets >= 50000) {
      // Common simplified divisor: eligible assets spread over 240 months
      const monthly = Math.round(assets / 240);
      document.getElementById("calcIncome").textContent = "$" + monthly.toLocaleString("en-US");
      result.hidden = false;
    } else {
      result.hidden = true;
    }
  });
}
