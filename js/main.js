/* ==========================================================================
   RoboSpark Academy — site script
   Small, dependency-free script: contact form modal + footer year.

   Smooth scrolling for internal navigation is handled in CSS
   (html { scroll-behavior: smooth }) — no JavaScript needed for it.
   ========================================================================== */

(function () {
	"use strict";

	/* ------------------------------------------------------------------
	   SITE CONFIGURATION — EDIT HERE

	   formUrl is the ONE place where the contact / trial form is set.

	   Both CTA buttons ("Book a free trial class" and "Message us to get
	   started") open a modal window with this Yandex Form embedded in an
	   iframe. The form asks for name, surname and email.

	   • Current value is the form created for this project:
	         https://forms.yandex.ru/u/6ad39c08852af3b798c7a1b8
	     To use another form, replace it with your published form URL
	     (Yandex Forms → Share → "Встроить на сайт" / publish link).
	   • Answers are collected by Yandex Forms itself. View them at
	     forms.yandex.ru → your form → tab "Ответы" (table view) and
	     export to XLSX / CSV / JSON. See README.md → "Getting the data".
	   • The href attributes in index.html are no-JavaScript fallbacks
	     (they open the form directly) — keep them in sync.
	   ------------------------------------------------------------------ */
	var SITE_CONFIG = {
		formUrl: "https://forms.yandex.ru/u/6ad39c08852af3b798c7a1b8"
	};

	var modal = document.getElementById("contact-modal");
	var frame = modal ? modal.querySelector("[data-form-frame]") : null;
	var lastFocused = null;
	var frameLoaded = false;

	/* The official Yandex Forms embed snippet (keep it working together
	   with the dynamic modal: embed.js resizes the frame to the full form
	   height via postMessage). */
	function loadYandexEmbed() {
		if (document.querySelector('script[src*="forms.yandex.ru/_static/embed.js"]')) return;
		var script = document.createElement("script");
		script.src = "https://forms.yandex.ru/_static/embed.js";
		document.head.appendChild(script);
	}

	/* --- Modal --------------------------------------------------------- */
	function openModal(trigger) {
		if (!modal || !SITE_CONFIG.formUrl) return;
		// Remember the element that OPENED the modal (not whatever happened
		// to be focused) so focus can be restored precisely on close.
		lastFocused = trigger || document.activeElement;

		// Set the iframe only once, on the first open — no third-party
		// request happens until the visitor asks for the form.
		if (!frameLoaded && frame) {
			loadYandexEmbed(); // official snippet: script before the iframe
			var idMatch = SITE_CONFIG.formUrl.replace(/\/+$/, "").match(/\/([A-Za-z0-9]+)$/);
			frame.setAttribute(
				"src",
				SITE_CONFIG.formUrl + (SITE_CONFIG.formUrl.indexOf("?") > -1 ? "&" : "?") + "iframe=1"
			);
			frame.setAttribute("name", "ya-form-" + (idMatch ? idMatch[1] : "contact"));
			frameLoaded = true;
		}

		modal.hidden = false;
		document.body.classList.add("modal-open");

		var closeBtn = modal.querySelector(".modal__close");
		if (closeBtn) closeBtn.focus();
	}

	function closeModal() {
		if (!modal || modal.hidden) return;
		modal.hidden = true;
		document.body.classList.remove("modal-open");
		if (lastFocused && lastFocused.isConnected && typeof lastFocused.focus === "function") {
			lastFocused.focus();
		}
	}

	function trapFocus(event) {
		var focusables = modal.querySelectorAll(
			'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
		);
		if (!focusables.length) return;
		var first = focusables[0];
		var last = focusables[focusables.length - 1];

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}

	/* --- CTA links: sync href + open the modal ------------------------- */
	document.querySelectorAll("[data-open-form]").forEach(function (link) {
		if (SITE_CONFIG.formUrl) link.setAttribute("href", SITE_CONFIG.formUrl);
		link.addEventListener("click", function (event) {
			if (!SITE_CONFIG.formUrl) return; // no config → plain link behaviour
			event.preventDefault();
			openModal(link);
		});
	});

	// Fallback link inside the modal keeps opening the form in a new tab,
	// but its href still follows SITE_CONFIG.formUrl.
	document.querySelectorAll("[data-form-href]").forEach(function (link) {
		if (SITE_CONFIG.formUrl) link.setAttribute("href", SITE_CONFIG.formUrl);
	});

	if (modal) {
		// Close button + backdrop
		modal.querySelectorAll("[data-modal-close]").forEach(function (el) {
			el.addEventListener("click", closeModal);
		});

		// Escape closes, Tab cycles inside the dialog
		document.addEventListener("keydown", function (event) {
			if (modal.hidden) return;
			if (event.key === "Escape") {
				event.preventDefault();
				closeModal();
			} else if (event.key === "Tab") {
				trapFocus(event);
			}
		});
	}

	// Footer copyright year
	document.querySelectorAll("[data-current-year]").forEach(function (node) {
		node.textContent = String(new Date().getFullYear());
	});
})();
