import { useEffect, useRef, useState } from "react";

const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = "resume-cv-builder-v3";

const blank = {
  experience: () => ({ id: uid(), role: "", company: "", start: "", end: "", desc: "" }),
  education: () => ({ id: uid(), degree: "", school: "", start: "", end: "" }),
  projects: () => ({ id: uid(), name: "", link: "", desc: "" }),
  certs: () => ({ id: uid(), title: "", issuer: "", year: "" }),
};

const sample = () => ({
  photo: "",
  photoShape: "round",
  name: "Your Name",
  title: "Full-Stack Developer",
  email: "you@example.com",
  phone: "+880 1XXX-XXXXXX",
  location: "Chattogram, Bangladesh",
  links: "github.com/yourname\nlinkedin.com/in/yourname",
  summary:
    "Developer with hands-on experience building web apps with Django and React. Comfortable taking a project from idea to deployment. Looking for freelance and remote opportunities.",
  experience: [
    {
      id: uid(),
      role: "Freelance Web Developer",
      company: "Self-employed",
      start: "2026",
      end: "Present",
      desc: "Built and deployed responsive web tools with React and Django\nDelivered client projects on time with clear communication\nSet up free hosting and automatic deploys with GitHub and Vercel",
    },
  ],
  education: [
    { id: uid(), degree: "B.Sc. in Computer Science", school: "Your University", start: "2019", end: "2023" },
  ],
  projects: [
    {
      id: uid(),
      name: "Bangla Number to Words",
      link: "yoursite.com/bangla-number-to-words",
      desc: "Free tool that converts numbers to Bangla words using the hazar-lakh-koti system, used for cheques and vouchers.",
    },
  ],
  skills: "Python, Django, React, JavaScript, HTML, CSS, Git, REST APIs, SQL",
  languages: "Bangla (Native), English (Professional)",
  personal: "Date of birth: 01 January 2000\nNationality: Bangladeshi\nMarital status: Single",
  certs: [{ id: uid(), title: "Responsive Web Design", issuer: "freeCodeCamp", year: "2025" }],
  publications: "",
  awards: "Dean's List, Spring 2022",
  references: "Available on request.",
});

/* ---------- 20 templates: 5 layouts x 4 heading styles ---------- */
const LAYOUTS = [
  ["sidebar", "Sidebar"],
  ["band", "Top Band"],
  ["classic", "Classic Serif"],
  ["minimal", "Minimal Line"],
  ["split", "Split Header"],
];
const HEADS = [
  ["underline", "Underline"],
  ["bar", "Left Bar"],
  ["boxed", "Boxed"],
  ["pill", "Pill"],
];
const PALETTE = [
  "#1d5e46", "#1e3a5f", "#1f4fd8", "#334155", "#8f2a3a",
  "#0f766e", "#7c3aed", "#b45309", "#0e7490", "#374151", "#111827",
];
const TEMPLATES = (() => {
  const list = [];
  let i = 0;
  for (const [lid, ltitle] of LAYOUTS) {
    for (const [hid, htitle] of HEADS) {
      list.push({
        id: `${lid}-${hid}`,
        label: `${ltitle} \u00b7 ${htitle}`,
        layout: lid,
        head: hid,
        color: PALETTE[i % PALETTE.length],
      });
      i++;
    }
  }
  return list;
})();

const FAQ = [
  {
    q: "Do I need to add a photo?",
    a: "No, it is optional in every template. For US, UK or Canada-style resumes it is best left off, since many employers and screening software prefer resumes without one. For a CV in Bangladesh, India or for academic and government applications a small photo is common but still not compulsory. Leave it off if in doubt.",
  },
  {
    q: "What is the difference between a resume and a CV?",
    a: "A resume is a short, one-page pitch tailored to a specific job. A CV is a fuller record of your education, experience, certifications, awards and publications, often two or more pages. Switch between them with the toggle above the form; the CV adds extra sections.",
  },
  {
    q: "How do I download it as a PDF?",
    a: "Click Download PDF. In the print window choose “Save as PDF” as the destination, set margins to Default, and turn off Headers and footers for a clean result.",
  },
  {
    q: "Is my data uploaded anywhere?",
    a: "No. Everything, including your photo, stays in your browser. Your draft is saved on this device only, so you can come back later.",
  },
];

function ItemFields({ item, fields, onChange, onDelete }) {
  return (
    <div className="cv-card">
      {fields.map(([key, label, multi]) =>
        multi ? (
          <label key={key}>
            {label}
            <textarea rows={3} value={item[key]} onChange={(e) => onChange(item.id, key, e.target.value)} />
          </label>
        ) : (
          <label key={key}>
            {label}
            <input value={item[key]} onChange={(e) => onChange(item.id, key, e.target.value)} />
          </label>
        )
      )}
      <button type="button" className="ghost" onClick={onDelete}>Remove</button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="r-sec">
      <h3><span>{title}</span></h3>
      {children}
    </section>
  );
}

const lines = (s) => (s || "").split("\n").map((x) => x.trim()).filter(Boolean);
const csv = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
const range = (a, b) => [a, b].filter(Boolean).join(" \u2013 ");
const kv = (l) => {
  const idx = l.indexOf(":");
  return idx > 0 ? [l.slice(0, idx).trim(), l.slice(idx + 1).trim()] : [l, ""];
};

export default function ResumeBuilder() {
  const initial = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && saved.d) return saved;
    } catch {
      /* storage unavailable: use defaults */
    }
    return null;
  })();

  const [d, setD] = useState(() => ({ ...sample(), ...(initial ? initial.d : {}) }));
  const [type, setType] = useState(initial?.type || "resume");
  const [tplId, setTplId] = useState(initial?.tplId || TEMPLATES[0].id);
  const [accent, setAccent] = useState(initial?.accent || "");
  const [pages, setPages] = useState(1);
  const paperRef = useRef(null);

  const tpl = TEMPLATES.find((t) => t.id === tplId) || TEMPLATES[0];
  const isWhite = accent === "white";
  const activeColor = isWhite ? "#161b26" : accent || tpl.color;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ d, type, tplId, accent }));
    } catch {
      /* quota or blocked: ignore */
    }
  }, [d, type, tplId, accent]);

  useEffect(() => {
    const el = paperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const p = Math.max(1, Math.ceil(el.scrollHeight / (el.offsetWidth * 1.4142) - 0.04));
      setPages(p);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tplId]);

  const isCV = type === "cv";
  const set = (key) => (e) => setD({ ...d, [key]: e.target.value });
  const setItem = (sec, id, key, val) =>
    setD({ ...d, [sec]: d[sec].map((x) => (x.id === id ? { ...x, [key]: val } : x)) });
  const addItem = (sec) => setD({ ...d, [sec]: [...d[sec], blank[sec]()] });
  const delItem = (sec, id) => setD({ ...d, [sec]: d[sec].filter((x) => x.id !== id) });
  const reset = () => {
    if (window.confirm("Clear everything and go back to the sample?")) setD(sample());
  };

  const onPhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const c = document.createElement("canvas");
      c.width = c.height = 400;
      c.getContext("2d").drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 400, 400);
      setD((prev) => ({ ...prev, photo: c.toDataURL("image/jpeg", 0.85) }));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  };

  const downloadPdf = () => {
    const prev = document.title;
    document.title = `${d.name || "Name"} - ${isCV ? "CV" : "Resume"}`;
    const restore = () => {
      document.title = prev;
      window.removeEventListener("afterprint", restore);
    };
    window.addEventListener("afterprint", restore);
    window.print();
  };

  const contact = [d.email, d.phone, d.location, ...lines(d.links)].filter(Boolean);

  const photoEl = d.photo ? (
    <div className={`r-photo ${d.photoShape}`}>
      <img src={d.photo} alt="" />
    </div>
  ) : null;

  const nameEl = (
    <div className="r-name">
      <h2>{d.name || "Your Name"}</h2>
      {d.title && <p className="r-title">{d.title}</p>}
    </div>
  );

  const contactEl = contact.length > 0 && (
    <Section title="Contact">
      <div className="r-contact">
        {contact.map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
    </Section>
  );

  const summaryEl = d.summary.trim() && (
    <Section title={isCV ? "Profile" : "Summary"}>
      <p>{d.summary}</p>
    </Section>
  );

  const experienceEl = d.experience.length > 0 && (
    <Section title="Experience">
      {d.experience.map((x) => (
        <div className="entry" key={x.id}>
          <div className="e-row">
            <strong>{x.role || "Role"}</strong>
            <span className="e-date">{range(x.start, x.end)}</span>
          </div>
          {x.company && <div className="e-sub">{x.company}</div>}
          {lines(x.desc).length > 0 && (
            <ul>
              {lines(x.desc).map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </Section>
  );

  const projectsEl = d.projects.length > 0 && (
    <Section title="Projects">
      {d.projects.map((x) => (
        <div className="entry" key={x.id}>
          <div className="e-row">
            <strong>{x.name || "Project"}</strong>
            <span className="e-date">{x.link}</span>
          </div>
          {x.desc && <p>{x.desc}</p>}
        </div>
      ))}
    </Section>
  );

  const educationEl = d.education.length > 0 && (
    <Section title="Education">
      {d.education.map((x) => (
        <div className="entry" key={x.id}>
          <div className="e-row">
            <strong>{x.degree || "Degree"}</strong>
            <span className="e-date">{range(x.start, x.end)}</span>
          </div>
          {x.school && <div className="e-sub">{x.school}</div>}
        </div>
      ))}
    </Section>
  );

  const skillsEl = csv(d.skills).length > 0 && (
    <Section title="Skills">
      <p className="chips">
        {csv(d.skills).map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </p>
    </Section>
  );

  const languagesEl = csv(d.languages).length > 0 && (
    <Section title="Languages">
      <ul className="plain">
        {csv(d.languages).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Section>
  );

  const personalEl = isCV && lines(d.personal).length > 0 && (
    <Section title="Personal information">
      <div className="kv">
        {lines(d.personal).map((l, i) => {
          const [k, v] = kv(l);
          return (
            <div key={i}>
              <span>{k}</span>
              {v && <b>{v}</b>}
            </div>
          );
        })}
      </div>
    </Section>
  );

  const certsEl = isCV && d.certs.length > 0 && (
    <Section title="Certifications & training">
      {d.certs.map((x) => (
        <div className="entry" key={x.id}>
          <div className="e-row">
            <strong>{x.title || "Certification"}</strong>
            <span className="e-date">{x.year}</span>
          </div>
          {x.issuer && <div className="e-sub">{x.issuer}</div>}
        </div>
      ))}
    </Section>
  );

  const pubsEl = isCV && lines(d.publications).length > 0 && (
    <Section title="Publications & research">
      <ul>
        {lines(d.publications).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Section>
  );

  const awardsEl = isCV && lines(d.awards).length > 0 && (
    <Section title="Awards & honours">
      <ul>
        {lines(d.awards).map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Section>
  );

  const refsEl = isCV && d.references.trim() && (
    <Section title="References">
      <p className="pre">{d.references}</p>
    </Section>
  );

  const pageNote = isCV
    ? `About ${pages} page${pages > 1 ? "s" : ""}. A CV can run 2 or more pages.`
    : pages > 1
    ? `About ${pages} pages. A resume works best on 1 page: shorten bullets or remove older roles.`
    : "Fits on 1 page.";

  return (
    <>
      <style>{css}</style>
      <div className="cv">
        <header className="cv-top no-print">
          <p className="eyebrow">Free &amp; no signup</p>
          <h1>Resume &amp; CV Maker</h1>
          <p className="lead">
            Choose a document type and a look, fill in your details, and download a
            polished PDF. Everything stays in your browser — nothing is uploaded.
          </p>
        </header>

        <div className="cv-grid">
          {/* ---------- Form ---------- */}
          <form className="cv-form no-print" onSubmit={(e) => e.preventDefault()}>
            <div className="seg" role="group" aria-label="Document type">
              <button type="button" aria-pressed={!isCV} onClick={() => setType("resume")}>
                Resume
                <small>1 page, short</small>
              </button>
              <button type="button" aria-pressed={isCV} onClick={() => setType("cv")}>
                CV
                <small>Full, 2+ pages</small>
              </button>
            </div>

            <fieldset>
              <legend>Template</legend>
              <label>
                Choose a style ({TEMPLATES.length} available)
                <select value={tplId} onChange={(e) => setTplId(e.target.value)}>
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Accent colour
                <div className="swatches">
                  {PALETTE.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className="swatch"
                      style={{ background: c }}
                      aria-label={c}
                      aria-pressed={!isWhite && activeColor === c}
                      onClick={() => setAccent(c)}
                    />
                  ))}
                  <button
                    type="button"
                    className="swatch white"
                    aria-label="White / black lines"
                    title="White — black text and lines instead of colour"
                    aria-pressed={isWhite}
                    onClick={() => setAccent("white")}
                  />
                </div>
              </label>
            </fieldset>

            <fieldset>
              <legend>Photo (optional)</legend>
              <p className="hint">
                {isCV
                  ? "Common on CVs in Bangladesh and for academic applications, but still optional."
                  : "Usually left off resumes for US/UK/Canada-style applications."}
              </p>
              <div className="photo-row">
                {d.photo ? <img src={d.photo} alt="Your photo" /> : <div className="ph">No photo</div>}
                <div className="photo-actions">
                  <label className="filebtn">
                    {d.photo ? "Change photo" : "Upload photo"}
                    <input type="file" accept="image/*" onChange={onPhoto} />
                  </label>
                  {d.photo && (
                    <button type="button" className="ghost" onClick={() => setD({ ...d, photo: "" })}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
              {d.photo && (
                <label>
                  Photo shape
                  <select value={d.photoShape} onChange={set("photoShape")}>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                  </select>
                </label>
              )}
            </fieldset>

            <fieldset>
              <legend>Personal details</legend>
              <label>Full name<input value={d.name} onChange={set("name")} /></label>
              <label>Job title<input value={d.title} onChange={set("title")} /></label>
              <div className="row">
                <label>Email<input value={d.email} onChange={set("email")} /></label>
                <label>Phone<input value={d.phone} onChange={set("phone")} /></label>
              </div>
              <label>Location<input value={d.location} onChange={set("location")} /></label>
              <label>
                Links (one per line)
                <textarea rows={2} value={d.links} onChange={set("links")} />
              </label>
            </fieldset>

            <fieldset>
              <legend>{isCV ? "Profile" : "Summary"}</legend>
              <textarea rows={4} value={d.summary} onChange={set("summary")} />
            </fieldset>

            <fieldset>
              <legend>Experience</legend>
              {d.experience.map((x) => (
                <ItemFields
                  key={x.id}
                  item={x}
                  onChange={(id, k, v) => setItem("experience", id, k, v)}
                  onDelete={() => delItem("experience", x.id)}
                  fields={[
                    ["role", "Role"],
                    ["company", "Company"],
                    ["start", "Start (e.g. 2024)"],
                    ["end", "End (e.g. Present)"],
                    ["desc", "What you did (one bullet per line)", true],
                  ]}
                />
              ))}
              <button type="button" className="ghost" onClick={() => addItem("experience")}>+ Add experience</button>
            </fieldset>

            <fieldset>
              <legend>Projects</legend>
              {d.projects.map((x) => (
                <ItemFields
                  key={x.id}
                  item={x}
                  onChange={(id, k, v) => setItem("projects", id, k, v)}
                  onDelete={() => delItem("projects", x.id)}
                  fields={[
                    ["name", "Project name"],
                    ["link", "Link"],
                    ["desc", "Description", true],
                  ]}
                />
              ))}
              <button type="button" className="ghost" onClick={() => addItem("projects")}>+ Add project</button>
            </fieldset>

            <fieldset>
              <legend>Education</legend>
              {d.education.map((x) => (
                <ItemFields
                  key={x.id}
                  item={x}
                  onChange={(id, k, v) => setItem("education", id, k, v)}
                  onDelete={() => delItem("education", x.id)}
                  fields={[
                    ["degree", "Degree"],
                    ["school", "School / University"],
                    ["start", "Start"],
                    ["end", "End"],
                  ]}
                />
              ))}
              <button type="button" className="ghost" onClick={() => addItem("education")}>+ Add education</button>
            </fieldset>

            <fieldset>
              <legend>Skills &amp; languages</legend>
              <label>
                Skills (comma separated)
                <textarea rows={2} value={d.skills} onChange={set("skills")} />
              </label>
              <label>
                Languages (comma separated)
                <input value={d.languages} onChange={set("languages")} />
              </label>
            </fieldset>

            {isCV && (
              <>
                <p className="cv-only">CV-only sections</p>

                <fieldset>
                  <legend>Personal information</legend>
                  <label>
                    One per line, as “Label: value”
                    <textarea rows={4} value={d.personal} onChange={set("personal")} />
                  </label>
                </fieldset>

                <fieldset>
                  <legend>Certifications &amp; training</legend>
                  {d.certs.map((x) => (
                    <ItemFields
                      key={x.id}
                      item={x}
                      onChange={(id, k, v) => setItem("certs", id, k, v)}
                      onDelete={() => delItem("certs", x.id)}
                      fields={[
                        ["title", "Title"],
                        ["issuer", "Issued by"],
                        ["year", "Year"],
                      ]}
                    />
                  ))}
                  <button type="button" className="ghost" onClick={() => addItem("certs")}>+ Add certification</button>
                </fieldset>

                <fieldset>
                  <legend>Publications &amp; research</legend>
                  <textarea rows={3} placeholder="One per line" value={d.publications} onChange={set("publications")} />
                </fieldset>

                <fieldset>
                  <legend>Awards &amp; honours</legend>
                  <textarea rows={2} placeholder="One per line" value={d.awards} onChange={set("awards")} />
                </fieldset>

                <fieldset>
                  <legend>References</legend>
                  <textarea rows={3} value={d.references} onChange={set("references")} />
                </fieldset>
              </>
            )}

            <button type="button" className="primary" onClick={downloadPdf}>Download PDF</button>
            <button type="button" className="ghost wide" onClick={reset}>Reset to sample</button>
          </form>

          {/* ---------- Preview ---------- */}
          <div>
            <p className={`pagenote no-print ${!isCV && pages > 1 ? "warn" : ""}`} aria-live="polite">
              {pageNote}
            </p>

            <section
              className="paper"
              ref={paperRef}
              data-layout={tpl.layout}
              data-head={tpl.head}
              data-white={isWhite ? "true" : undefined}
              style={{ "--accent": activeColor }}
              aria-label={isCV ? "CV preview" : "Resume preview"}
            >
              {tpl.layout === "sidebar" ? (
                <>
                  <aside className="r-side">
                    {photoEl}
                    {contactEl}
                    {skillsEl}
                    {languagesEl}
                    {personalEl}
                  </aside>
                  <div className="r-main">
                    {nameEl}
                    {summaryEl}
                    {experienceEl}
                    {projectsEl}
                    {educationEl}
                    {certsEl}
                    {pubsEl}
                    {awardsEl}
                    {refsEl}
                  </div>
                </>
              ) : tpl.layout === "split" ? (
                <div className="r-main">
                  <header className="r-head split">
                    {nameEl}
                    {photoEl}
                  </header>
                  {contact.length > 0 && (
                    <div className="r-contact bar">
                      {contact.map((c, i) => (
                        <span key={i}>{c}</span>
                      ))}
                    </div>
                  )}
                  {summaryEl}{experienceEl}{projectsEl}{educationEl}
                  {certsEl}{skillsEl}{languagesEl}{personalEl}{pubsEl}{awardsEl}{refsEl}
                </div>
              ) : (
                <div className="r-main">
                  <header className="r-head">
                    {tpl.layout === "classic" && photoEl}
                    {nameEl}
                    {tpl.layout !== "classic" && photoEl}
                  </header>
                  {contact.length > 0 && (
                    <div className="r-contact bar">
                      {contact.map((c, i) => (
                        <span key={i}>{c}</span>
                      ))}
                    </div>
                  )}
                  {summaryEl}{experienceEl}{projectsEl}{educationEl}
                  {certsEl}{skillsEl}{languagesEl}{personalEl}{pubsEl}{awardsEl}{refsEl}
                </div>
              )}
            </section>
          </div>
        </div>

        <section className="cv-info no-print">
          <h2>Resume vs CV: which one do you need?</h2>
          <p>
            A resume is a one-page pitch tailored to a job. A CV is the full
            story of your education, work, certifications and achievements, and
            it can run several pages. Use a resume for most private-sector
            applications, and a CV for academic, research, government or
            overseas applications that ask for one.
          </p>
          <h2>Questions</h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      </div>
    </>
  );
}

/* ---------- Styles ---------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');

.cv { --ink:#171b26; --muted:#5a6373; --line:#dfe3ea; --ui:#1f4fd8; --bg:#f4f5f8;
  color-scheme: light; background:
    radial-gradient(1200px 480px at 10% -10%, #eef1fb 0%, transparent 60%),
    radial-gradient(1000px 420px at 100% 0%, #f2f7f4 0%, transparent 55%), var(--bg);
  color: var(--ink); min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; line-height: 1.55;
  padding: 32px 16px 70px; }
.cv * { box-sizing: border-box; }
.cv-top { max-width: 1200px; margin: 0 auto 24px; }
.eyebrow { margin: 0 0 6px; font-size: .74rem; letter-spacing: .14em; text-transform: uppercase;
  color: var(--ui); font-weight: 700; }
.cv-top h1 { font-family: 'Fraunces', serif; font-weight: 600; font-size: clamp(1.7rem, 4vw, 2.35rem);
  margin: 0 0 8px; line-height: 1.2; }
.cv-top .lead { margin: 0; color: var(--muted); max-width: 60ch; }

.cv-grid { max-width: 1200px; margin: 0 auto; display: grid; gap: 22px;
  grid-template-columns: minmax(0, 410px) minmax(0, 1fr); align-items: start; }
@media (max-width: 900px) { .cv-grid { grid-template-columns: 1fr; } }

/* ----- Form ----- */
.cv-form { background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 18px;
  box-shadow: 0 1px 2px rgba(20,30,60,.04), 0 10px 30px -20px rgba(20,30,60,.15); }
.cv-form fieldset { border: 0; padding: 0; margin: 0 0 18px; display: grid; gap: 8px; }
.cv-form legend { font-weight: 700; padding: 0; margin-bottom: 6px; }
.cv-form label { display: grid; gap: 4px; font-size: .85rem; color: var(--muted); }
.cv-form .hint { margin: -2px 0 4px; font-size: .8rem; color: var(--muted); }
.cv-form input:not([type=file]), .cv-form select, .cv-form textarea {
  width: 100%; font: inherit; font-size: .95rem; color: var(--ink); background: #fff;
  border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; transition: border-color .15s; }
.cv-form input:hover, .cv-form select:hover, .cv-form textarea:hover { border-color: #b7c0cf; }
.cv-form textarea { resize: vertical; }
.cv-form input:focus-visible, .cv-form select:focus-visible, .cv-form textarea:focus-visible,
.cv button:focus-visible, .cv summary:focus-visible, .cv .filebtn:focus-within { outline: 3px solid var(--ui); outline-offset: 2px; }
.cv .row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.cv-card { display: grid; gap: 8px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; background: #f8fafc; }
.cv button { font: inherit; cursor: pointer; border-radius: 8px; }
.cv .primary { width: 100%; padding: 13px; font-weight: 700; border: 0;
  background: linear-gradient(135deg, var(--ui), #2f3bb0); color: #fff;
  box-shadow: 0 8px 18px -8px rgba(31,79,216,.55); }
.cv .primary:hover { filter: brightness(1.05); }
.cv .ghost { border: 1px solid var(--line); background: #fff; color: var(--ink); padding: 7px 10px; justify-self: start; }
.cv .ghost:hover { border-color: #b7c0cf; }
.cv .ghost.wide { width: 100%; margin-top: 8px; justify-self: stretch; text-align: center; }
.cv-only { margin: 4px 0 12px; padding-top: 14px; border-top: 1px dashed var(--line);
  font-size: .72rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ui); font-weight: 700; }

.seg { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 4px; background: #eef1f5;
  border-radius: 12px; margin-bottom: 18px; }
.seg button { border: 0; background: transparent; padding: 10px 8px; font-weight: 700; color: var(--muted);
  display: grid; line-height: 1.25; border-radius: 9px; }
.seg button small { font-weight: 400; font-size: .74rem; }
.seg button[aria-pressed="true"] { background: #fff; color: var(--ink); box-shadow: 0 1px 3px rgba(0,0,0,.12); }

.swatches { display: flex; flex-wrap: wrap; gap: 6px; }
.swatch { width: 24px; height: 24px; border-radius: 50%; border: 2px solid #fff;
  box-shadow: 0 0 0 1px var(--line); padding: 0; }
.swatch[aria-pressed="true"] { box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--ui); }
.swatch.white { background: #fff; position: relative; }
.swatch.white::after { content: ""; position: absolute; inset: 3px; border-radius: 50%;
  background: linear-gradient(135deg, transparent 46%, var(--line) 46%, var(--line) 54%, transparent 54%); }

.photo-row { display: flex; align-items: center; gap: 12px; }
.photo-row img, .photo-row .ph { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; flex: none; }
.photo-row .ph { display: grid; place-items: center; background: #eef1f5; color: var(--muted); font-size: .68rem; text-align: center; }
.photo-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
.filebtn { display: inline-block !important; cursor: pointer; border: 1px solid var(--line); background: #fff;
  color: var(--ink) !important; padding: 7px 12px; border-radius: 8px; font-size: .88rem !important; }
.filebtn input { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; }

.pagenote { margin: 0 0 8px; font-size: .85rem; color: var(--muted); }
.pagenote.warn { color: #a45a00; font-weight: 600; }

/* ----- Paper ----- */
.paper { --accent: #1d5e46; background: #fff; color: #1a1f2b; border: 1px solid var(--line);
  border-radius: 6px; min-height: 640px; box-shadow: 0 2px 10px rgba(20,30,50,.06), 0 20px 50px -30px rgba(20,30,50,.25);
  -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: .88rem; overflow: hidden; }
.paper h2 { margin: 0; font-size: 1.85rem; line-height: 1.15; letter-spacing: -.01em; }
.paper p { margin: 0; }
.r-main { padding: 34px 38px; }
@media (max-width: 520px) { .r-main { padding: 22px; } }
.r-title { margin-top: 4px !important; font-size: 1.02rem; color: var(--accent); font-weight: 600; }
.r-sec { margin-top: 18px; }
.r-sec:first-child { margin-top: 0; }
.r-sec h3 { margin: 0 0 8px; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
  color: var(--accent); font-weight: 700; }
.entry { margin-bottom: 11px; break-inside: avoid; }
.e-row { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.e-date { color: #5a6474; font-size: .82rem; }
.e-sub { color: #3f4857; font-weight: 500; }
.paper ul { margin: 4px 0 0; padding-left: 18px; }
.paper li { margin-bottom: 2px; }
.paper ul.plain { list-style: none; padding: 0; margin: 0; }
.pre { white-space: pre-line; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chips span { border: 1px solid var(--accent); border-radius: 5px; padding: 1px 8px; font-size: .82rem; }
.kv { display: grid; gap: 3px; }
.kv div { display: flex; gap: 8px; }
.kv span { color: #5a6474; min-width: 110px; }
.kv b { font-weight: 600; }

.r-photo { flex: none; overflow: hidden; width: 100px; height: 100px; }
.r-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.r-photo.round { border-radius: 50%; }
.r-photo.square { border-radius: 10px; }

.r-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 10px; }
.r-head.split { align-items: flex-start; }
.r-contact { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: .84rem; color: #3f4857; }
.r-contact.bar { padding: 9px 0 13px; margin-bottom: 4px; border-bottom: 1px solid var(--line); }

/* ---- Heading style variants ---- */
.paper[data-head="underline"] .r-sec h3 span { display: block; padding-bottom: 5px; border-bottom: 1.5px solid var(--accent); }
.paper[data-head="bar"] .r-sec h3 span { display: block; padding-left: 9px; border-left: 4px solid var(--accent); }
.paper[data-head="boxed"] .r-sec h3 span { display: inline-block; padding: 3px 9px; background: var(--accent);
  color: #fff; border-radius: 4px; }
.paper[data-head="pill"] .r-sec h3 span { display: inline-block; padding: 3px 12px; border: 1.5px solid var(--accent);
  border-radius: 999px; }

/* ---- Layout: band (top colour band) ---- */
.paper[data-layout="band"] .r-main { border-top: 9px solid var(--accent); }
.paper[data-layout="band"] h2 { color: var(--accent); }

/* ---- Layout: classic (centered serif) ---- */
.paper[data-layout="classic"] { font-family: 'Fraunces', Georgia, serif; }
.paper[data-layout="classic"] .r-head { flex-direction: column; text-align: center; }
.paper[data-layout="classic"] .r-contact { justify-content: center; }
.paper[data-layout="classic"] .r-title { color: #333; font-weight: 500; font-style: italic; }
.paper[data-layout="classic"] .chips span { border: 0; padding: 0; }
.paper[data-layout="classic"] .chips span:not(:last-child)::after { content: ","; }

/* ---- Layout: minimal (quiet, ATS-friendly) ---- */
.paper[data-layout="minimal"] .r-head { border: 0; }
.paper[data-layout="minimal"] h2 { color: var(--ink); }
.paper[data-layout="minimal"] .r-title { color: var(--accent); }

/* ---- Layout: split (name left, photo right) ---- */
.paper[data-layout="split"] .r-head.split { padding-bottom: 14px; border-bottom: 2px solid var(--accent); }

/* ---- Layout: sidebar ---- */
.paper[data-layout="sidebar"] { display: grid; grid-template-columns: 32% 1fr; }
.r-side { background: var(--accent); color: #fff; padding: 30px 20px; display: flex; flex-direction: column; gap: 4px; }
.r-side .r-photo { margin: 0 auto 14px; width: 116px; height: 116px; border: 3px solid rgba(255,255,255,.85); }
.r-side .r-sec { margin-top: 16px; }
.r-side .r-sec:first-of-type { margin-top: 0; }
.r-side .r-sec h3 { color: #fff; }
.r-side .r-sec h3 span { border-color: rgba(255,255,255,.55) !important; color: #fff; }
.paper:not([data-white="true"])[data-head="boxed"] .r-side .r-sec h3 span { background: rgba(255,255,255,.18); }
.r-side .r-contact { flex-direction: column; gap: 4px; color: #fff; font-size: .82rem; word-break: break-word; }
.r-side .chips span { border-color: rgba(255,255,255,.6); color: #fff; }
.r-side .kv div { flex-direction: column; gap: 0; }
.r-side .kv span { color: rgba(255,255,255,.75); min-width: 0; font-size: .75rem; }
.r-side .kv b { color: #fff; }
@media (max-width: 620px) { .paper[data-layout="sidebar"] { grid-template-columns: 1fr; } }

/* ---- White / paper accent: black text and lines instead of a colour fill ---- */
.paper[data-white="true"] .r-side { background: #f6f7f9; color: var(--ink); border-right: 1px solid var(--line); }
.paper[data-white="true"] .r-side .r-sec h3, .paper[data-white="true"] .r-side .r-sec h3 span { color: var(--ink); }
.paper[data-white="true"] .r-side .r-photo { border-color: var(--line); }
.paper[data-white="true"] .r-side .r-contact { color: var(--ink); }
.paper[data-white="true"] .r-side .chips span { border-color: var(--ink); color: var(--ink); }
.paper[data-white="true"] .r-side .kv span { color: #6b7280; }
.paper[data-white="true"] .r-side .kv b { color: var(--ink); }
.paper[data-white="true"][data-head="boxed"] .r-sec h3 span { color: #fff; }
.paper[data-white="true"] .r-side .r-sec h3 span { border-color: var(--ink) !important; color: var(--ink); }
.paper[data-white="true"][data-head="boxed"] .r-side .r-sec h3 span { background: #1f2430; color: #fff; }
.paper[data-white="true"][data-head="pill"] .r-side .r-sec h3 span { border-color: var(--ink) !important; }

/* ----- Info ----- */
.cv-info { max-width: 760px; margin: 44px auto 0; }
.cv-info h2 { font-family: 'Fraunces', serif; font-weight: 600; font-size: 1.25rem; margin: 26px 0 8px; }
.cv-info details { border-bottom: 1px solid var(--line); padding: 10px 0; }
.cv-info summary { cursor: pointer; font-weight: 600; }
.cv-info details p { margin: 8px 0 0; color: var(--muted); }

@media print {
  @page { margin: 12mm; }
  body { background: #fff !important; }
  .no-print { display: none !important; }
  .cv { background: #fff; padding: 0; min-height: 0; }
  .cv-grid { display: block; max-width: none; }
  .paper { border: 0; box-shadow: none; border-radius: 0; min-height: 0; overflow: visible; }
  .paper[data-layout="band"] .r-main { border-top-width: 8px; }
  .r-main { padding: 0 2mm; }
  .paper[data-layout="sidebar"] .r-main { padding: 0 6mm; }
  .paper[data-layout="band"] .r-main { padding-top: 6mm; }
}
`;
