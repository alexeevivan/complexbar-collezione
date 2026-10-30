import Swiper from 'swiper';
import { Navigation, Pagination, Parallax, Autoplay } from 'swiper/modules';
import $ from 'jquery';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// HERO SLIDER
let menu = [];
$('.swiper-slide').each(function (index) {
	menu.push($(this).find('.slide-inner').attr("data-text"));
});
let interleaveOffset = 0.5;
let swiperOptions = {
	modules: [Navigation, Pagination, Parallax, Autoplay],
	loop: true,
	speed: 500,
	parallax: true,
	// autoplay: {
	// 	delay: 6500,
	// 	disableOnInteraction: false,
	// },
	watchSlidesProgress: true,
	pagination: {
		el: '.swiper-pagination',
		clickable: true,
	},

	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},

	on: {
		progress: function () {
			let swiper = this;
			for (let i = 0; i < swiper.slides.length; i++) {
				let slideProgress = swiper.slides[i].progress;
				let innerOffset = swiper.width * interleaveOffset;
				let innerTranslate = slideProgress * innerOffset;
				swiper.slides[i].querySelector(".slide-inner").style.transform =
					"translate3d(" + innerTranslate + "px, 0, 0)";
			}
		},

		touchStart: function () {
			let swiper = this;
			for (let i = 0; i < swiper.slides.length; i++) {
				swiper.slides[i].style.transition = "";
			}
		},

		setTransition: function (speed) {
			let swiper = this;
			for (let i = 0; i < swiper.slides.length; i++) {
				swiper.slides[i].style.transition = speed + "ms";
				swiper.slides[i].querySelector(".slide-inner").style.transition =
					speed + "ms";
			}
		}
	}
};

let swiper = new Swiper(".swiper-container", swiperOptions);

// DATA BACKGROUND IMAGE
let sliderBgSetting = $(".slide-bg-image");
sliderBgSetting.each(function (indx) {
	if ($(this).attr("data-background")) {
		$(this).css("background-image", "url(" + $(this).data("background") + ")");
	}
});

