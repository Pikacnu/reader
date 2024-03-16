const text = document.getElementById('text');
const zhheight = document.getElementById('zh-test').offsetHeight / 2;
const zhwidth = document.getElementById('zh-test').offsetWidth / 2;
const enheight = document.getElementById('en-test').offsetHeight / 2;
const enwidth = document.getElementById('en-test').offsetWidth / 2;
const devicewidth = window.innerWidth;
const deviceheight = window.innerHeight;
const pageselecter = document.getElementById('pageselecter');

let texts = `wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa因何而發生？
-- 第0章 --
羅大經曾經認為
-- 第2章 --
，
- 第3章 -住世一日，則做一日好人，居官一日，則做一日好事。希望各位能用心體會這段話。謹慎地來說，我們必須考慮到所有可能。我們要從本質思考，從根本解決問題。wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa，到底應該如何實現。由於，維吉爾曾經認為，勞動征服一切。這段話非常有意思。wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa改變了我的命運。wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa的出現，重寫了人生的意義。不難發現，問題在於該用什麼標準來做決定呢？想必大家都能了解wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa的重要性。我們不得不面對一個非常尷尬的事實，那就是，wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa的存在，令我無法停止對他的思考。查爾斯·史考伯相信，一個人幾乎可以在任何他懷有無限熱忱的事情上成功。。這不禁令我深思。其實，若思緒夠清晰，那麼wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa也就不那麼複雜了。夏多布里昂告訴我們，一個人絕不會僅僅因為用憎惡的眼光看待世人就能顯出他的優越。這啟發了我。這樣看來，斯賓塞深信，科學是系統化了的知識。這啟發了我。我想，把wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa的意義想清楚，對各位來說並不是一件壞事。馬爾頓曾經認為，堅強的信心，能使平凡的人做出驚人的事業。這句話改變了我的人生。盧梭說過一句富有哲理的話，自然與美德，受到社會、財產的產物學問和藝術的侵害。這啟發了我。若能夠洞悉wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa各種層面的含義，勢必能讓思維再提高一個層級。問題的關鍵究竟為何？面對如此難題，我們必須設想周全。話雖如此，我們卻也不能夠這麼篤定。wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa，發生了會如何，不發生又會如何。要想清楚，wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa，到底是一種怎麼樣的存在。現在，正視wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa的問題，是非常非常重要的。因為，了解清楚wdwdsaaaaaaaaaaaaaaaaaaaaaaaaaaaa到底是一種怎麼樣的存在，是解決一切問題的關鍵。
那麼，在這種困難的抉擇下，本人思來想去，寢食難安。`;
if (texts === '') texts = `你好，世界!`; // default ch
let haveChapter = true;

let cookies;
let cookieupdate = () =>
	(cookies = new Map(document.cookie.split('; ').map((e) => e.split('='))));
cookieupdate();
const getCookie = (name) => cookies.get(name);
function setCookie(name, value) {
	document.cookie = `${name}=${value};samesite=lax;`;
	cookieupdate();
}

function getPages(isHorizontal, textinput) {
	if (isHorizontal) {
		const maxheight = Math.round(text.offsetHeight / zhheight) / 2;
		const maxwidth = Math.round(text.offsetWidth / zhwidth) - 1;
		console.log(maxheight, maxwidth);
		let data = textinput
			.replaceAll('\n', '₩')
			.replaceAll(/，/g, '，₩')
			.replaceAll(/。/g, '。₩')
			.replaceAll('　', '')
			.replaceAll(/ /g, '')
			.split('₩')
			.map((e) => {
				if (e.length >= maxwidth) {
					let test = e.match(new RegExp(`.{1,${maxwidth - 1}}`, 'g'));
					let result = [];
					for (const item of test) {
						result.push(item);
					}
					return result;
				}
				return e;
			})
			.map((e) => `<span>${e}</span>`)
			.reduce((acc, cur) => {
				if (!Array.isArray(acc[acc.length - 1])) return [[acc, cur]];
				if (acc[acc.length - 1].length < maxwidth) {
					acc[acc.length - 1].push(cur);
					return acc;
				}
				acc.push([cur]);
				return acc;
			});
		return data;
	}

	const maxheight = Math.round(text.offsetHeight / zhheight) - 2;
	const maxwidth = Math.round(text.offsetWidth / zhwidth) / 2;
	console.log(maxheight, maxwidth);
	let temp = textinput;
	return temp
		.replaceAll('\n', '₩')
		.replaceAll(/，/g, '，₩')
		.replaceAll(/。/g, '。₩')
		.replaceAll('　', '')
		.replaceAll(/“/g, '﹁')
		.replaceAll(/”/g, '﹂')
		.replaceAll(/《/g, '︽')
		.replaceAll(/》/g, '︾')
		.replaceAll(/（/g, '︵')
		.replaceAll(/）/g, '︶')
		.replaceAll(/\(/g, '︵')
		.replaceAll(/\)/g, '︶')
		.replaceAll(/〔/g, '︹')
		.replaceAll(/〕/g, '︺')
		.replaceAll(/〈/g, '︿')
		.replaceAll(/〉/g, '﹀')
		.replaceAll(/【/g, '︻')
		.replaceAll(/】/g, '︼')
		.replaceAll(/：/g, ':')
		.replaceAll(/—/g, '|')
		.replaceAll(/!/g, '!')
		.split('₩')
		.reduce((acc, e) => {
			if (e.length >= maxheight) {
				let chunks = e.match(new RegExp(`.{1,${maxheight - 1}}`, 'g'));
				return acc.concat(chunks.map((chunk) => `<span>${chunk}</span>`));
			}
			return acc.concat(`<span>${e}</span>`);
		}, [])
		.reduce((acc, cur) => {
			if (!Array.isArray(acc)) acc = [acc];
			if (acc.length > 1) {
				const last = acc.pop();
				if (acc[acc.length - 1].includes(last)) {
					return acc.concat(cur);
				}
				if (last.length + cur.length <= maxheight) {
					acc.push(last + cur);
				} else {
					acc.push(last);
					acc.push(cur);
				}
			} else {
				acc.push(cur);
			}
			return acc;
		}, [])
		.map((e) => {
			if (e.match(/([^\u4E00-\u9FFF\n]+)/gm)) {
				return e.replaceAll(/([^\u4E00-\u9FFF\n]+)/gm, '<span>$1</span>');
			}
			return e;
		})
		.map((e) => `<span>${e}</span>`)
		.reduce((acc, cur) => {
			if (!Array.isArray(acc[acc.length - 1])) return [[acc, cur]];
			if (acc[acc.length - 1].length < maxwidth) {
				acc[acc.length - 1].push(cur);
				return acc;
			}
			acc.push([cur]);
			return acc;
		});
}
function pageUpdate(cpage) {
	if (cpage < 1 || cpage > totalpages) return;
	text.innerHTML = pages[cpage - 1].join('');
	current.innerHTML = cpage;
	totalpages = pages.length;
	totalpage.innerHTML = pages.length;
	page = cpage;
}

//chapter
// Change Chapter

const chapterprev = document.getElementById('chap-prev');
const chapternext = document.getElementById('chap-next');

let chapter = 0;

if (haveChapter) {
	chapternext.addEventListener('click', () => {
		if (chapter < totalchapters - 1) {
			chapter++;
			chapterUpdate(chapter, false);
		}
	});
	chapterprev.addEventListener('click', () => {
		if (chapter > 0) {
			chapter--;
			chapterUpdate(chapter, true);
		}
	});
	pageselecter.classList.toggle('space-between');
} else {
	chapternext.style.display = 'none';
	chapterprev.style.display = 'none';
}
function getChapter(text) {
	return text.split(/-+ 第\d+章 -+/gm).map((e) => {
		return getPages(false, e);
	});
}

let chapters = getChapter(texts);
let totalchapters = chapters.length;

function chapterUpdate(num, end) {
	if (!(chapter >= 0 && chapter < totalchapters)) return;
	pages = chapters[num];
	if (end) {
		pageUpdate(pages.length);
	} else {
		pageUpdate(1);
	}
	chapter = num;
	document.title = `第${num + 1}章`;
}

// Init for first page

const totalpage = document.getElementById('total');
const current = document.getElementById('current');

let pages = getPages(getCookie('isHorizontal') === 'true', texts);
let totalpages = pages.length;
let page = 1;
total.innerHTML = pages.length;
text.innerHTML = pages[0].join('');
current.innerHTML = 1;

const prev = document.getElementById('prev');
const touchprev = document.getElementById('touchprev');
const next = document.getElementById('next');
const touchnext = document.getElementById('touchnext');

prev.addEventListener('click', prevpage);
next.addEventListener('click', nextpage);
touchnext.addEventListener('click', nextpage);
touchprev.addEventListener('click', prevpage);

function nextpage() {
	if (page < totalpages) {
		prev.disable = false;
		page++;
		pageUpdate(page);
		return;
	}
	if (haveChapter && chapter < totalchapters - 1 && page === totalpages)
		chapterUpdate(chapter + 1, false);
	next.disable = true;
}

function prevpage() {
	if (page > 1) {
		next.disable = false;
		page--;
		return pageUpdate(page);
	}
	if (haveChapter && chapter > 0 && page === 1)
		chapterUpdate(chapter - 1, true);
	prev.disable = true;
}
document.body.addEventListener('keydown', (_) => {
	if (_.key === 'ArrowRight') nextpage();
	if (_.key === 'ArrowLeft') prevpage();
});

//Day/Night mode
// Change Light Mode and Dark Mode

let light = false;

const lightchanger = document.getElementById('lightchanger');
let isSettingbarOpen = false;
let settingclicked = false;

const lightupdate = (_) => {
	light = !light;
	document.body.classList.toggle('nightly', light);
	lightchanger.innerHTML = !light
		? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"/></svg>'
		: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"/></svg>';
	settingclicked = true;
	setCookie('light', light);
};

lightchanger.addEventListener('click', lightupdate);

// Font setting tab
// Change Font Setting Open

const fontsetting = document.getElementById('fontsettingtab');
let fontsettingopen = false;

fontsetting.addEventListener('click', (_) => {
	fontsettingopen = !fontsettingopen;
	const tab = document.getElementById('textsettingtable');
	tab.classList.toggle('hidden', !fontsettingopen);
	tab.classList.toggle('touchable', fontsettingopen);
	settingclicked = true;
});

// Font Size
// Change Font Size

const fontresizer = document.getElementById('fontsize');

let font = devicewidth < 700 ? 5 : 1.5;
fontresizer.min = 0;
fontresizer.max = 2;
fontresizer.step = 0.1;
fontresizer.value = font;
fontresizer.addEventListener('input', (_) => {
	const size =
		_.target.value * (devicewidth < 700 ? 5 / 2 : 1 / 2) +
		(devicewidth > 700 ? 1 : 2);
	document.body.style.setProperty('--fontsize', `${size}vw`);
	document.body.style.setProperty('--setting-fontsize', `${(size * 3) / 5}vw`);
	console.log(_.target.value);
	setCookie('fontsize', _.target.value);
	settingclicked = true;
});
fontresizer.addEventListener('click', (_) => {
	settingclicked = true;
});

//Font bold
// Change Font Weight

const fontbold = document.getElementById('fontbold');

fontbold.addEventListener('input', (_) => {
	document.body.style.setProperty('--font-weight', _.target.value);
	settingclicked = true;
	setCookie('fontweight', _.target.value);
});
fontbold.addEventListener('click', (_) => {
	settingclicked = true;
});

// Color setting tab
// Change Color Setting Open

const colorsetting = document.getElementById('colorsettingtab');
let colorsettingopen = false;

colorsetting.addEventListener('click', (_) => {
	colorsettingopen = !colorsettingopen;
	const tab = document.getElementById('colorsettingtable');
	tab.classList.toggle('hidden', !colorsettingopen);
	tab.classList.toggle('touchable', colorsettingopen);
	settingclicked = true;
});

//Textcolor setting
// Change Text Color

const textcolor = document.getElementById('textcolor');
textcolor.value = document.body.style.getPropertyValue('--text-color');

textcolor.addEventListener('input', (e) => {
	const color = e.target.value;
	document.body.style.setProperty('--text', color);
	document.getElementById('showtexthex').innerHTML = color;
	setCookie('textcolor', color);
	settingclicked = true;
});
textcolor.addEventListener('click', (e) => {
	settingclicked = true;
});

//Background color setting
// Change Background Color

const backgroundcolor = document.getElementById('backgroundcolor');
backgroundcolor.value = document.body.style.getPropertyValue('--text-color');

const changeBackgroundColor = (e) => {
	const color = e.target.value;
	document.body.style.setProperty('--background', color);
	document.getElementById('showbackhex').innerHTML = color;
	setCookie('background', color);
	settingclicked = true;
};

backgroundcolor.addEventListener('input', changeBackgroundColor);
backgroundcolor.addEventListener('click', (e) => {
	settingclicked = true;
});

//Setting Bar
// high light search result and remove search result when click on it

const searchtab = document.getElementById('searchtab');

let searchopen = false;

searchtab.addEventListener('click', (e) => {
	searchopen = !searchopen;
	const tab = document.getElementById('searchtable');
	tab.classList.toggle('hidden', !searchopen);
	tab.classList.toggle('touchable', searchopen);
	settingclicked = true;
});

const searchinput = document.getElementById('searchinput');

searchinput.addEventListener('click', () => {
	settingclicked = true;
});

const searchbtn = document.getElementById('search');

let searched = false;

searchbtn.addEventListener('click', (e) => {
	search(searchinput.value);
	searched = true;
	settingclicked = true;
});

const removesearch = document.getElementById('removesearch');

removesearch.addEventListener('click', (e) => {
	removeHighLight();
	searchinput.value = '';
	searched = false;
	settingclicked = true;
});

function search(target) {
	pages = pages.map((page) =>
		page.map((line) => {
			if (line.includes(target)) {
				const regex = new RegExp(target, 'g');
				return line.replace(regex, `<span class="highlight">${target}</span>`);
			}
			return line;
		}),
	);
	text.innerHTML = pages[page - 1].join('');
}
function removeHighLight() {
	pages = pages.map((page) =>
		page.map((line) => {
			if (line.includes('<span class="highlight">')) {
				line = line.replaceAll('<span class="highlight">', '');
				line = line.replaceAll('</span>', '');
			}
			return line;
		}),
	);
	text.innerHTML = pages[page - 1].join('');
}

//Text Direction
// Change Text Direction

let isHorizontal = getCookie('isHorizontal') === 'true' ? true : false;

const textdirection = document.getElementById('textdirectiontab');

textdirection.addEventListener('click', (_) => {
	isHorizontal = !isHorizontal;
	textdirection.innerHTML = isHorizontal
		? '<svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m14.6961816 11.6470802.0841184.0726198 2 2c.2662727.2662727.2904793.682876.0726198.9764816l-.0726198.0841184-2 2c-.2929.2929-.7677.2929-1.0606 0-.2662727-.2662727-.2904793-.682876-.0726198-.9764816l.0726198-.0841184.7196-.7197h-10.6893c-.41421 0-.75-.3358-.75-.75 0-.3796833.28215688-.6934889.64823019-.7431531l.10176981-.0068469h10.6893l-.7196-.7197c-.2929-.2929-.2929-.7677 0-1.0606.2662727-.2662727.682876-.2904793.9764816-.0726198zm-8.1961616-8.6470802c.30667 0 .58246.18671.69635.47146l3.00003 7.50004c.1538.3845-.0333.821-.41784.9749-.38459.1538-.82107-.0333-.9749-.4179l-.81142-2.0285h-2.98445l-.81142 2.0285c-.15383.3846-.59031.5717-.9749.4179-.38458-.1539-.57165-.5904-.41781-.9749l3-7.50004c.1139-.28475.38968-.47146.69636-.47146zm8.1961616 1.14705264.0841184.07261736 2 2c.2662727.26626364.2904793.68293223.0726198.97654222l-.0726198.08411778-2 2c-.2929.29289-.7677.29289-1.0606 0-.2662727-.26626364-.2904793-.68293223-.0726198-.97654222l.0726198-.08411778.7196-.7196675h-3.6893c-.4142 0-.75-.3357925-.75-.7500025 0-.3796925.2821653-.69348832.6482323-.74315087l.1017677-.00684663h3.6893l-.7196-.7196725c-.2929-.29289-.2929-.76777 0-1.06066.2662727-.26626364.682876-.29046942.9764816-.07261736zm-8.1961616 1.62238736-.89223 2.23056h1.78445z" fill="#212121"/></svg>'
		: '<svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="m13.75 12c.4142 0 .75.3358.75.75v1.6894l.7197-.7197c.2929-.2929.7677-.2929 1.0606 0s.2929.7677 0 1.0606l-2 2c-.0753.0754-.1627.1313-.2559.1679-.0489333.0192667-.1003556.0335111-.1536444.0421407l-.1207556.0097093-.0395-.00105c-.0817-.0043-.16-.0216-.2327-.0499-.0941-.0366-.1822-.0928-.2581-.1688l-2-2c-.2929-.2929-.2929-.7774 0-1.0703s.7677-.2832 1.0606.0097l.7197.7197v-1.6894c0-.4142.3358-.75.75-.75zm-8-9c.41421 0 .7500025.33579.7500025.75v10.6893l.7196675-.7196c.29289-.2929.76777-.2929 1.06066 0s.29289.7677 0 1.0606l-2 2c-.29289.2929-.76777.2929-1.06066 0l-2-2c-.29289-.2929-.29289-.7677 0-1.0606s.76777-.2929 1.06066 0l.7196725.7196v-10.6893c0-.41421.3357875-.75.7499975-.75zm7.75 0c.3067 0 .5825.18671.6964.47146l3 7.50004c.1538.3845-.0333.821-.4178.9749-.3846.1538-.8211-.0333-.9749-.4179l-.8115-2.0285h-2.9844l-.8114 2.0285c-.1539.3846-.5903.5717-.9749.4179-.38461-.1539-.57168-.5904-.41784-.9749l3.00004-7.50004c.1139-.28475.3896-.47146.6963-.47146zm0 2.76944-.8922 2.23056h1.7844z" fill="#212121"/></svg>';
	text.classList.toggle('column');
	pages = getPages(isHorizontal, texts);
	pageUpdate(page);
	settingclicked = true;
	setCookie('isHorizontal', !isHorizontal.toString());
});

addEventListener('resize', () => {
	pages = getPages(isHorizontal, texts);
	page = 1;
	pageUpdate(page);
});

//setting bar

const settingbar = document.getElementById('settingbar');
const touchsetting = document.getElementById('touchsetting');

const toggleSettingBar = () => {
	if (settingclicked) return (settingclicked = false);
	settingbar.classList.toggle('active', !isSettingbarOpen);
	const tab = document.getElementById('tablist');
	tab.classList.toggle('touchable', !isSettingbarOpen);
	isSettingbarOpen = !isSettingbarOpen;
};

document.body.addEventListener('click', (e) => {
	if (
		!settingbar.contains(e.target) &&
		!touchsetting.contains(e.target) &&
		isSettingbarOpen
	) {
		toggleSettingBar();
	}
});

settingbar.addEventListener('click', toggleSettingBar);
touchsetting.addEventListener('click', toggleSettingBar);

//load setting from cookie if exist

if (getCookie('background')) {
	document.body.style.setProperty('--background', getCookie('background'));
	backgroundcolor.value = getCookie('background');
}

if (getCookie('textcolor')) {
	document.body.style.setProperty('--text', getCookie('textcolor'));
	textcolor.value = getCookie('textcolor');
}

if (getCookie('fontsize')) {
	const size =
		getCookie('fontsize') * (devicewidth < 700 ? 5 / 2 : 1 / 2) +
		(devicewidth > 700 ? 1 : 2);
	document.body.style.setProperty('--fontsize', `${size}vw`);
	document.body.style.setProperty('--setting-fontsize', `${(size * 3) / 5}vw`);
	fontresizer.value = getCookie('fontsize');
}

if (getCookie('fontweight')) {
	document.body.style.setProperty('--font-weight', getCookie('fontweight'));
	fontbold.value = getCookie('fontweight');
}

if (getCookie('light')) {
	lightupdate();
}

const getCurrentTextCount = () =>
	chapters
		.slice(0, chapter + 1)
		.map((p, i) => {
			if (i < chapter) return p;
			return p.slice(0, page - 1);
		})
		.reduce(
			(acc, cur) =>
				acc +
				cur.reduce((acc, cur) => {
					return acc + cur.reduce((acc, cur) => acc + cur.length, 0);
				}, 0),
			0,
		) + 1;

const textCountToPages = (count) => {
	if (!count || count === 0) return 0;
	const data = chapters.reduce(
		(acc, cur) => {
			if (acc.pass) return acc;
			let pass = acc.pass;
			const pagedata = cur.reduce(
				(acc, cur) => {
					if (acc.pass) return acc;
					const pagedata = cur.reduce(
						(acc, cur) => {
							if (acc.pass) return acc;
							acc.page++;
							if (acc.count + cur.length > count) {
								return {
									count: acc.count + cur.length,
									page: acc.page,
									pass: true,
								};
							}
							return {
								count: acc.count + cur.length,
								page: acc.page + 1,
								pass: acc.pass,
							};
						},
						{
							count: acc.count,
							page: 0,
							pass: false,
						},
					);
					acc.page++;
					if (acc.count + pagedata.count > count) {
						return {
							count: acc.count + pagedata.count,
							page: acc.page,
							pass: true,
						};
					}
					return {
						count: acc.count + pagedata.count,
						page: acc.page + 1,
						pass: acc.pass,
					};
				},
				{
					count: acc.count,
					page: 0,
					pass: false,
				},
			);
			if (acc.count + pagedata.count > count) {
				pass = true;
				acc.chapter - 1;
			}
			return {
				count: acc.count + pagedata.count,
				chapter: acc.chapter + 1,
				page: pagedata.page,
				pass: pass,
			};
		},
		{
			chapter: 0,
			page: 0,
			count: 0,
			pass: false,
		},
	);
	return data;
};

const test = () => {
	let data = getCurrentTextCount();
	let count = data === 0 ? 1 : data;
	const result = textCountToPages(count);
	chapterUpdate(result.chapter - 1);
	pageUpdate(result.page + 1);
};
chapterUpdate(0);
