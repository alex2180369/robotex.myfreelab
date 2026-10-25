/* ==========================================================================
   RoboSpark Academy — site script
   Small, dependency-free script: trial-class form modal + footer year.

   Smooth scrolling for internal navigation is handled in CSS
   (html { scroll-behavior: smooth }) — no JavaScript needed for it.
   ========================================================================== */

(function () {
	"use strict";

	/* ------------------------------------------------------------------
	   SITE CONFIGURATION — EDIT HERE

	   googleSheetsUrl is the address of the Google Apps Script web app that
	   receives the form (see google-apps-script/Code.gs in the project
	   repository). Each request becomes a row on the sheet "robotex".

	   Both CTA buttons ("Book a free trial class" and "Message us to get
	   started") open the modal window with this form. The form asks for
	   name, surname and email.
	   ------------------------------------------------------------------ */
	var SITE_CONFIG = {
		googleSheetsUrl: "https://script.google.com/macros/s/AKfycbymy7csfZY35SZP53O13DHC3PkIV5vDFC775UsWtwq1iznGw4myiUYPqRRUUVfVwIB7Gg/exec"
	};

	var modal = document.getElementById("contact-modal");
	var form = document.getElementById("trial-form");
	var statusEl = document.getElementById("trial-status");
	var lastFocused = null;

	/* --- Modal --------------------------------------------------------- */
	function openModal(trigger) {
		if (!modal) return;
		// Remember the element that OPENED the modal (not whatever happened
		// to be focused) so focus can be restored precisely on close.
		lastFocused = trigger || document.activeElement;

		modal.hidden = false;
		document.body.classList.add("modal-open");

		var first = form ? form.querySelector("input[name='name']") : null;
		if (first) first.focus();
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
			'a[href], button:not([disabled]), input:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])'
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

	/* --- CTA links: open the modal ------------------------------------- */
	// The href (mailto:) is the fallback when JavaScript is unavailable.
	document.querySelectorAll("[data-open-form]").forEach(function (link) {
		link.addEventListener("click", function (event) {
			if (!modal) return;
			event.preventDefault();
			openModal(link);
		});
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

	/* --- Form ---------------------------------------------------------- */
	function setStatus(text, kind) {
		if (!statusEl) return;
		statusEl.textContent = text;
		statusEl.className = "modal__status" + (kind ? " " + kind : "");
	}

	if (form) {
		form.addEventListener("submit", function (event) {
			event.preventDefault();
			var data = {};
			new FormData(form).forEach(function (value, key) { data[key] = String(value); });

			// Trap for bots: a real visitor never sees this field.
			if (data.website) return;

			var bad = false;
			["name", "surname", "email"].forEach(function (key) {
				var field = form.elements[key];
				var value = (data[key] || "").trim();
				var ok = key === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.length >= 2;
				field.classList.toggle("invalid", !ok);
				if (!ok) bad = true;
			});
			if (bad) {
				setStatus("Please fill in your name, surname and a valid email.", "err");
				return;
			}

			if (!SITE_CONFIG.googleSheetsUrl) {
				setStatus("Form is not connected yet. Please email us instead.", "err");
				return;
			}

			var button = form.querySelector("button[type='submit']");
			button.disabled = true;
			setStatus("Sending…");

			var payload = {
				site: "robotex.myfreelab.ru",
				name: data.name.trim() + " " + data.surname.trim(),
				contact: data.email.trim(),
				comment: "Free trial class request",
				page: window.location.href,
				submittedAtLocal: new Date().toLocaleString("ru-RU")
			};

			// text/plain avoids the CORS preflight request, which Apps Script does not answer.
			fetch(SITE_CONFIG.googleSheetsUrl, {
				method: "POST",
				headers: { "Content-Type": "text/plain;charset=utf-8" },
				body: JSON.stringify(payload)
			}).then(function (response) {
				if (!response.ok) throw new Error("HTTP " + response.status);
				form.reset();
				setStatus("Thank you! We got your request and will reply by email soon.", "ok");
			}).catch(function () {
				setStatus("Could not send the request. Please try again or email us.", "err");
			}).finally(function () {
				button.disabled = false;
			});
		});
	}

	// Footer copyright year
	document.querySelectorAll("[data-current-year]").forEach(function (node) {
		node.textContent = String(new Date().getFullYear());
	});
})();
