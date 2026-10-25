/* ==========================================================================
   RoboSpark Academy — site script
   Small, dependency-free script: trial-class form + footer year.

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
	   started") scroll to the form in the last block of the page (#trial).
	   The form asks for name, surname and email.
	   ------------------------------------------------------------------ */
	var SITE_CONFIG = {
		googleSheetsUrl: "https://script.google.com/macros/s/AKfycbymy7csfZY35SZP53O13DHC3PkIV5vDFC775UsWtwq1iznGw4myiUYPqRRUUVfVwIB7Gg/exec"
	};

	var form = document.getElementById("trial-form");
	var statusEl = document.getElementById("trial-status");

	/* --- CTA links: scroll (CSS does it) and focus the first field ------ */
	document.querySelectorAll('a[href="#trial"]').forEach(function (link) {
		link.addEventListener("click", function () {
			var first = form ? form.querySelector("input[name='name']") : null;
			if (first) {
				setTimeout(function () {
					try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); }
				}, 600);
			}
		});
	});

	/* --- Form ---------------------------------------------------------- */
	function setStatus(text, kind) {
		if (!statusEl) return;
		statusEl.textContent = text;
		statusEl.className = "trial-form__status" + (kind ? " " + kind : "");
	}

	if (form) {
		form.addEventListener("submit", function (event) {
			event.preventDefault();
			var data = {};
			new FormData(form).forEach(function (value, key) { data[key] = String(value); });

			// Trap for bots: a real visitor never sees this field.
			if (data.website) return;

			// English only: names in Latin letters, ASCII email. Cyrillic is rejected with a clear message.
			var NAME_RE = /^[A-Za-z][A-Za-z .\u0027\u2019-]{1,59}$/;
			var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
			var bad = false;
			var nonLatin = false;
			["name", "surname", "email"].forEach(function (key) {
				var field = form.elements[key];
				var value = (data[key] || "").trim();
				var ok = (key === "email" ? EMAIL_RE : NAME_RE).test(value);
				if (!ok && /[^\u0000-\u007F]/.test(value)) nonLatin = true;
				field.classList.toggle("invalid", !ok);
				if (!ok) bad = true;
			});
			if (bad) {
				setStatus(
					nonLatin
						? "Please use English (Latin) letters only, for example Anna Petrova."
						: "Please fill in your name, surname and a valid email in English.",
					"err"
				);
				var firstBad = form.querySelector(".invalid");
				if (firstBad) firstBad.focus();
				return;
			}

			if (!SITE_CONFIG.googleSheetsUrl) {
				setStatus("The form is not connected yet. Please email us instead.", "err");
				return;
			}

			var button = form.querySelector("button[type='submit']");
			var idleLabel = button.textContent;
			button.disabled = true;
			button.textContent = "Sending…";
			setStatus("Sending…");

			var payload = {
				site: "robotex.myfreelab.ru",
				name: data.name.trim() + " " + data.surname.trim(),
				contact: data.email.trim(),
				comment: "Free trial class request",
				page: window.location.href,
				submittedAtLocal: new Date().toLocaleString("ru-RU")
			};

			// Do not wait forever if the network hangs.
			var controller = typeof AbortController === "function" ? new AbortController() : null;
			var timer = controller ? setTimeout(function () { controller.abort(); }, 25000) : null;

			// text/plain avoids the CORS preflight request, which Apps Script does not answer.
			fetch(SITE_CONFIG.googleSheetsUrl, {
				method: "POST",
				headers: { "Content-Type": "text/plain;charset=utf-8" },
				body: JSON.stringify(payload),
				signal: controller ? controller.signal : undefined
			}).then(function (response) {
				if (!response.ok) throw new Error("HTTP " + response.status);
				form.reset();
				button.textContent = "Request sent ✓";
				setStatus("Thank you! We got your request and will reply by email soon.", "ok");
			}).catch(function () {
				button.textContent = "Not sent, try again";
				setStatus("Could not send the request. Please try again or email us.", "err");
			}).finally(function () {
				if (timer) clearTimeout(timer);
				button.disabled = false;
				setTimeout(function () { button.textContent = idleLabel; }, 6000);
			});
		});
	}

	// Footer copyright year
	document.querySelectorAll("[data-current-year]").forEach(function (node) {
		node.textContent = String(new Date().getFullYear());
	});
})();
