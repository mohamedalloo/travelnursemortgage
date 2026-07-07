# TravelNurseMortgage

Flagship landing site for travelnursemortgage.com — travel-nurse home loan lead generation, an AdaptLend service. Teal identity, RetiredRefi architecture.

Static site: `index.html` + `styles.css` + `script.js`. No build step.

## Lead storage

Form inserts into the shared AdaptLend Supabase `leads` table (insert-only RLS, publishable key in `script.js`). Attribution: `matched_product` suffix `— TravelNurseMortgage`. Note: this form stores employment type in `income` (agency-w2 / 1099 / staff-w2 / mixed) and work history in `docs` (under-1yr / 1-2yrs / 2plus-yrs); `property` defaults to "primary".

## Deploy

Same GitHub Pages pattern: push, enable Pages from `main` root (CNAME in place), Namecheap DNS (4 GitHub A records + www CNAME), Enforce HTTPS. Point satellites (travelnursehomeloan.com, travelnurseloan.com, nurseheloc.com, nurserefi.com, loansfornurses.com, nursehomeloan.com) here or at adaptlend.com/nurses.html per the portfolio dashboard.

## Compliance notes

- Brand of the AdaptLend service (Honest Casa LLC, NMLS #1566096, DRE #02022356). Confirm DBA requirements with counsel.
- Stipend-counting claims are hedged ("with some lenders, when documented") and the footer carries a not-tax-advice disclaimer for tax-home content — keep both.
- No welcome email wired; success screen mentions email — wire or soften before heavy traffic.
