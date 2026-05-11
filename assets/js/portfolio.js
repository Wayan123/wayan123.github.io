/* =============================================================
   Wayan Dadang — Portfolio
   Vanilla JS — no jQuery, no framework
   Responsibilities: nav, scroll-reveal, data rendering, filters
   ============================================================= */
(() => {
	"use strict";

	const $ = (sel, root = document) => root.querySelector(sel);
	const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
	const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	/* ---------- 1. Navigation ---------- */
	const nav = $(".nav");
	const toggle = $(".nav__toggle");
	const links = $(".nav__links");

	if (nav) {
		const onScroll = () => {
			nav.classList.toggle("is-scrolled", window.scrollY > 12);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
	}

	if (toggle && links) {
		toggle.addEventListener("click", () => {
			const open = links.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});
		$$(".nav__links a", links).forEach((a) =>
			a.addEventListener("click", () => {
				links.classList.remove("is-open");
				toggle.setAttribute("aria-expanded", "false");
			})
		);
	}

	/* ---------- 2. Scroll-spy nav highlight ---------- */
	const sections = $$("section[id]");
	const navLinks = $$(".nav__links a");
	if (sections.length && navLinks.length && "IntersectionObserver" in window) {
		const spy = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const id = entry.target.getAttribute("id");
					navLinks.forEach((a) =>
						a.classList.toggle(
							"is-active",
							a.getAttribute("href") === `#${id}`
						)
					);
				});
			},
			{ rootMargin: "-40% 0px -55% 0px", threshold: 0 }
		);
		sections.forEach((s) => spy.observe(s));
	}

	/* ---------- 3. Reveal on scroll ---------- */
	const revealables = $$(".reveal");
	if (revealables.length && "IntersectionObserver" in window && !reduced) {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("is-visible");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -40px" }
		);
		revealables.forEach((el) => io.observe(el));
	} else {
		revealables.forEach((el) => el.classList.add("is-visible"));
	}

	/* ---------- 4. Data loader helpers ---------- */
	const readJSON = (id) => {
		const el = document.getElementById(id);
		if (!el) return null;
		try {
			return JSON.parse(el.textContent.trim());
		} catch (err) {
			console.error(`Bad JSON in #${id}:`, err);
			return null;
		}
	};

	const esc = (s = "") =>
		String(s).replace(
			/[&<>"']/g,
			(c) =>
				({
					"&": "&amp;",
					"<": "&lt;",
					">": "&gt;",
					'"': "&quot;",
					"'": "&#39;",
				}[c])
		);

	// Whitelist-based link rendering (safer than allowing arbitrary html)
	const safeLinkHost = (url = "") => {
		try {
			return new URL(url).hostname.replace(/^www\./, "");
		} catch {
			return "";
		}
	};

	const external = (href) =>
		`target="_blank" rel="noopener noreferrer"` +
		` href="${esc(href)}"`;

	/* ---------- 5. Render Experience ---------- */
	const renderExperience = () => {
		const mount = $("#exp-mount");
		const data = readJSON("data-experience");
		if (!mount || !Array.isArray(data)) return;
		mount.innerHTML = data
			.map(
				(it, i) => `
			<li class="tl-item reveal" data-delay="${i % 3}">
				<span class="tl-period">${esc(it.period || "")}</span>
				<div class="tl-role">${esc(it.role || "")}</div>
				<div class="tl-org">${
					it.orgUrl
						? `<a ${external(it.orgUrl)}>${esc(it.org || "")}</a>`
						: esc(it.org || "")
				}</div>
				${
					Array.isArray(it.bullets) && it.bullets.length
						? `<div class="tl-body"><ul>${it.bullets
								.map((b) => `<li>${esc(b)}</li>`)
								.join("")}</ul></div>`
						: it.summary
						? `<div class="tl-body"><p>${esc(it.summary)}</p></div>`
						: ""
				}
			</li>`
			)
			.join("");
		// re-observe new nodes for reveal
		observeNewReveal(mount);
	};

	/* ---------- 6. Render Projects ---------- */
	const renderProjects = () => {
		const mount = $("#proj-mount");
		const filterMount = $("#proj-filters");
		const data = readJSON("data-projects");
		if (!mount || !Array.isArray(data)) return;

		const allTags = Array.from(
			new Set(data.flatMap((p) => p.tags || []))
		).sort();
		const filters = ["All", ...allTags];
		if (filterMount) {
			filterMount.innerHTML = filters
				.map(
					(t, i) =>
						`<button class="filter ${
							i === 0 ? "is-active" : ""
						}" data-filter="${esc(t)}">${esc(t)}</button>`
				)
				.join("");
		}

		const renderList = (filter = "All") => {
			const filtered =
				filter === "All"
					? data
					: data.filter((p) => (p.tags || []).includes(filter));
			mount.innerHTML = filtered
				.map(
					(p, i) => `
				<article class="card reveal" data-delay="${i % 3}">
					${
						p.image
							? `<div class="card__thumb"><img src="${esc(
									p.image
							  )}" alt="${esc(p.title)}" loading="lazy" /></div>`
							: ""
					}
					${
						p.kicker
							? `<div class="card__eyebrow">${esc(p.kicker)}</div>`
							: ""
					}
					<h3 class="card__title">${esc(p.title)}</h3>
					<p class="card__desc">${esc(p.description || "")}</p>
					${
						Array.isArray(p.tags) && p.tags.length
							? `<div class="card__tags">${p.tags
									.map((t) => `<span class="tag">${esc(t)}</span>`)
									.join("")}</div>`
							: ""
					}
					${
						Array.isArray(p.links) && p.links.length
							? `<div class="card__links">${p.links
									.map(
										(l) =>
											`<a ${external(l.url)}>${esc(l.label)}</a>`
									)
									.join("")}</div>`
							: ""
					}
				</article>`
				)
				.join("");
			observeNewReveal(mount);
		};
		renderList("All");

		if (filterMount) {
			filterMount.addEventListener("click", (e) => {
				const btn = e.target.closest(".filter");
				if (!btn) return;
				$$(".filter", filterMount).forEach((b) =>
					b.classList.remove("is-active")
				);
				btn.classList.add("is-active");
				renderList(btn.dataset.filter);
			});
		}
	};

	/* ---------- 7. Render Competitions ---------- */
	const renderCompetitions = () => {
		const mount = $("#comp-mount");
		const data = readJSON("data-competitions");
		if (!mount || !Array.isArray(data)) return;
		mount.innerHTML = data
			.map(
				(c, i) => `
			<article class="comp-card reveal" data-delay="${i % 3}">
				${
					c.image
						? `<div class="comp-card__img"><img src="${esc(
								c.image
						  )}" alt="${esc(c.title)}" loading="lazy" /></div>`
						: ""
				}
				<div class="comp-card__body">
					<div class="comp-card__meta">${esc(c.year || "")} &middot; ${esc(
					c.venue || ""
				)}</div>
					<h4>${esc(c.title)}</h4>
					<p>${esc(c.description || "")}</p>
					${
						c.result
							? `<div><span class="tag tag--accent">${esc(
									c.result
							  )}</span></div>`
							: ""
					}
				</div>
			</article>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 8. Render Publications ---------- */
	const renderPublications = () => {
		const mount = $("#pub-mount");
		const data = readJSON("data-publications");
		if (!mount || !Array.isArray(data)) return;
		mount.innerHTML = data
			.map(
				(p, i) => `
			<article class="pub reveal" data-delay="${i % 3}">
				<h3 class="pub__title">${esc(p.title)}</h3>
				<div class="pub__cite">
					${esc(p.authors || "")} &middot;
					<span class="venue">${esc(p.venue || "")}</span>
					${p.year ? ` &middot; ${esc(p.year)}` : ""}
					${p.type ? ` &middot; ${esc(p.type)}` : ""}
				</div>
				${p.abstract ? `<p class="pub__abs">${esc(p.abstract)}</p>` : ""}
				${
					Array.isArray(p.links) && p.links.length
						? `<div class="pub__links">${p.links
								.map(
									(l) =>
										`<a ${external(l.url)}>${esc(
											l.label
										)} ↗</a>`
								)
								.join("")}</div>`
						: ""
				}
			</article>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 9. Render Talks ---------- */
	const renderTalks = () => {
		const mount = $("#talk-mount");
		const data = readJSON("data-talks");
		if (!mount) return;
		if (!Array.isArray(data) || data.length === 0) {
			mount.innerHTML = emptyState(
				"Catalog is being refreshed",
				"Talk archive is being updated. Drop me a line if you want to invite me to speak — topics I cover live below in Courses."
			);
			return;
		}
		mount.innerHTML = data
			.map(
				(t, i) => `
			<div class="talk reveal" data-delay="${i % 3}">
				<div class="talk__date">${esc(t.date || "")}</div>
				<div class="talk__body">
					<h4>${esc(t.title)}</h4>
					<p>${esc(t.venue || "")}${
					t.role ? ` &middot; ${esc(t.role)}` : ""
				}</p>
				</div>
				<div class="talk__scope-wrap">
					<span class="scope scope--${
						(t.scope || "").toLowerCase() === "international"
							? "intl"
							: "natl"
					}">${esc(t.scope || "")}</span>
				</div>
			</div>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 10. Render Courses ---------- */
	const renderCourses = () => {
		const mount = $("#course-mount");
		const data = readJSON("data-courses");
		if (!mount) return;
		if (!Array.isArray(data) || data.length === 0) {
			mount.innerHTML = emptyState(
				"Course modules loading",
				"The course catalogue is being expanded. Check back soon."
			);
			return;
		}
		mount.innerHTML = data
			.map(
				(c, i) => `
			<article class="card reveal" data-delay="${i % 3}">
				<div class="card__eyebrow">${esc(c.domain || "Module")}${
					c.level ? ` &middot; ${esc(c.level)}` : ""
				}</div>
				<h3 class="card__title">${esc(c.title)}</h3>
				<p class="card__desc">${esc(c.description || "")}</p>
				${
					Array.isArray(c.outcomes) && c.outcomes.length
						? `<div class="card__tags">${c.outcomes
								.map(
									(o) => `<span class="tag">${esc(o)}</span>`
								)
								.join("")}</div>`
						: ""
				}
			</article>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 11. Render Certifications ---------- */
	const renderCertifications = () => {
		const mount = $("#cert-mount");
		const data = readJSON("data-certifications");
		if (!mount) return;
		if (!Array.isArray(data) || data.length === 0) {
			mount.innerHTML = emptyState(
				"Certificates being catalogued",
				"I'm consolidating scans and verification links for each certificate. Until then, the most up-to-date list lives on LinkedIn.",
				[
					{
						url: "https://www.linkedin.com/in/wayan-dadang-801757116/",
						label: "View on LinkedIn",
					},
				]
			);
			return;
		}
		mount.innerHTML = data
			.map(
				(c, i) => `
			<article class="card reveal" data-delay="${i % 3}">
				<div class="card__eyebrow">${esc(c.issuer || "Issuer")}${
					c.year ? ` &middot; ${esc(c.year)}` : ""
				}</div>
				<h3 class="card__title">${esc(c.title)}</h3>
				${c.summary ? `<p class="card__desc">${esc(c.summary)}</p>` : ""}
				${
					Array.isArray(c.tags) && c.tags.length
						? `<div class="card__tags">${c.tags
								.map((t) => `<span class="tag">${esc(t)}</span>`)
								.join("")}</div>`
						: ""
				}
				${
					c.verifyUrl
						? `<div class="card__links"><a ${external(
								c.verifyUrl
						  )}>Verify credential</a></div>`
						: ""
				}
			</article>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 12. Render Awards ---------- */
	const renderAwards = () => {
		const mount = $("#awards-mount");
		const data = readJSON("data-awards");
		if (!mount || !Array.isArray(data)) return;
		mount.innerHTML = data
			.map(
				(a, i) => `
			<article class="card reveal" data-delay="${i % 3}">
				<div class="card__eyebrow">${esc(a.year || "")}${
					a.scope
						? ` &middot; <span class="mono">${esc(
								a.scope
						  )}</span>`
						: ""
				}</div>
				<h3 class="card__title">${esc(a.title)}</h3>
				<p class="card__desc">${esc(a.description || "")}</p>
			</article>`
			)
			.join("");
		observeNewReveal(mount);
	};

	/* ---------- 13. Empty state helper ---------- */
	const emptyState = (heading, copy, actions = []) => `
		<div class="empty reveal">
			<h4>${esc(heading)}</h4>
			<p>${esc(copy)}</p>
			${
				actions.length
					? `<div class="card__links" style="justify-content:center">${actions
							.map(
								(a) =>
									`<a ${external(a.url)}>${esc(a.label)}</a>`
							)
							.join("")}</div>`
					: ""
			}
		</div>`;

	/* ---------- 14. Re-observe freshly mounted nodes ---------- */
	let sharedIO = null;
	if ("IntersectionObserver" in window && !reduced) {
		sharedIO = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("is-visible");
						sharedIO.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -40px" }
		);
	}
	const observeNewReveal = (root) => {
		const items = $$(".reveal", root).filter(
			(el) => !el.classList.contains("is-visible")
		);
		if (!sharedIO) {
			items.forEach((el) => el.classList.add("is-visible"));
			return;
		}
		items.forEach((el) => sharedIO.observe(el));
	};

	/* ---------- 15. Hero year ---------- */
	const yearSlot = $("#now-year");
	if (yearSlot) yearSlot.textContent = new Date().getFullYear();

	/* ---------- 16. Boot ---------- */
	const boot = () => {
		renderExperience();
		renderProjects();
		renderCompetitions();
		renderPublications();
		renderTalks();
		renderCourses();
		renderCertifications();
		renderAwards();
	};
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
