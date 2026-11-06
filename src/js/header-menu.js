export function initHeaderMenu() {
	const burger = document.querySelector('.burger');
	const header = document.querySelector('.header');
	const body = document.body;

	if (!burger || !header) return;

	let lockedScrollY = 0;

	function lockScroll() {
		lockedScrollY = window.scrollY;
		body.style.top = `-${lockedScrollY}px`;
		body.classList.add('fixed');
	}

	function unlockScroll() {
		body.classList.remove('fixed');
		body.style.top = '';
		window.scrollTo({ top: lockedScrollY, left: 0, behavior: 'instant' });
	}

	burger.addEventListener('click', () => {
		const isOpen = header.classList.toggle('menu-opened');
		burger.classList.toggle('active', isOpen);
		burger.classList.toggle('inverted', isOpen);

		if (isOpen) {
			lockScroll();
		} else {
			unlockScroll();
		}
	});
}
