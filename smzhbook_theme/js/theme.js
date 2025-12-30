/**
 * GitBook 风格主题 JavaScript
 * 提供交互功能：菜单切换、搜索、目录高亮等
 */

(function() {
    'use strict';

    // ========== 全局变量 ==========
    var book = document.querySelector('.book');
    var bookSummary = document.querySelector('.book-summary');
    var bookBody = document.querySelector('.book-body');
    var menuToggle = null;

    // ========== 初始化 ==========
    function init() {
        createMenuToggle();
        bindEvents();
        initSearch();
        initTocHighlight();
        initSmoothScroll();
    }

    // ========== 创建移动端菜单按钮 ==========
    function createMenuToggle() {
        if (!book) return;

        menuToggle = document.createElement('button');
        menuToggle.className = 'menu-toggle';
        menuToggle.innerHTML = '☰';
        menuToggle.setAttribute('aria-label', 'Toggle menu');
        document.body.appendChild(menuToggle);
    }

    // ========== 绑定事件 ==========
    function bindEvents() {
        if (!book || !menuToggle) return;

        // 移动端菜单切换
        menuToggle.addEventListener('click', toggleMenu);

        // 点击内容区域关闭菜单（移动端）
        if (bookBody) {
            bookBody.addEventListener('click', function() {
                if (window.innerWidth <= 768 && isMenuOpen()) {
                    closeMenu();
                }
            });
        }

        // 窗口大小改变时重置菜单状态
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });

        // 键盘事件
        document.addEventListener('keydown', function(e) {
            // ESC 键关闭菜单
            if (e.key === 'Escape' && isMenuOpen()) {
                closeMenu();
            }
        });
    }

    // ========== 切换菜单 ==========
    function toggleMenu() {
        if (isMenuOpen()) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // ========== 打开菜单 ==========
    function openMenu() {
        if (!book || !bookSummary || !bookBody) return;

        book.classList.remove('without-animation');
        bookSummary.style.left = '0';
        bookBody.style.left = '300px';
        document.body.style.overflow = 'hidden';
    }

    // ========== 关闭菜单 ==========
    function closeMenu() {
        if (!book || !bookSummary || !bookBody) return;

        book.classList.add('without-animation');
        bookSummary.style.left = '-300px';
        bookBody.style.left = '0';
        document.body.style.overflow = '';
    }

    // ========== 检查菜单是否打开 ==========
    function isMenuOpen() {
        if (!bookSummary) return false;
        return bookSummary.style.left === '0px';
    }

    // ========== 初始化搜索功能 ==========
    function initSearch() {
        var searchInput = document.getElementById('mkdocs-search-query');
        if (!searchInput) return;

        // 防抖搜索
        var debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function() {
                performSearch(e.target.value);
            }, 300);
        });

        // 回车搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(debounceTimer);
                performSearch(e.target.value);
            }
        });
    }

    // ========== 执行搜索 ==========
    function performSearch(query) {
        if (!query || query.trim() === '') {
            showSearchResults(false);
            return;
        }

        // 如果有内置的搜索功能，使用它
        if (typeof window.Search !== 'undefined') {
            window.Search.query(query);
        }
    }

    // ========== 显示/隐藏搜索结果 ==========
    function showSearchResults(show) {
        var searchResults = document.getElementById('book-search-results');
        var searchNoResults = document.querySelector('.search-noresults');
        var searchResultsList = document.querySelector('.search-results');

        if (!searchResults) return;

        if (show) {
            searchResults.style.display = 'block';
            if (searchNoResults) searchNoResults.style.display = 'none';
            if (searchResultsList) searchResultsList.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
            if (searchNoResults) searchNoResults.style.display = 'block';
            if (searchResultsList) searchResultsList.style.display = 'none';
        }
    }

    // ========== 初始化目录高亮 ==========
    function initTocHighlight() {
        var pageToc = document.querySelector('.page-toc');
        if (!pageToc) return;

        var tocLinks = pageToc.querySelectorAll('a');
        if (tocLinks.length === 0) return;

        // 滚动时高亮当前目录项
        window.addEventListener('scroll', debounce(function() {
            highlightCurrentTocItem(tocLinks);
        }, 100));
    }

    // ========== 高亮当前目录项 ==========
    function highlightCurrentTocItem(tocLinks) {
        var scrollPos = window.scrollY + 100;
        var activeLink = null;

        tocLinks.forEach(function(link) {
            var targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            var targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            var targetTop = targetElement.offsetTop;
            var targetBottom = targetTop + targetElement.offsetHeight;

            if (scrollPos >= targetTop && scrollPos < targetBottom) {
                activeLink = link;
            }

            // 重置样式
            link.style.color = '#666';
            link.style.fontWeight = 'normal';
        });

        // 高亮当前项
        if (activeLink) {
            activeLink.style.color = '#4CAF50';
            activeLink.style.fontWeight = 'bold';
        }
    }

    // ========== 初始化平滑滚动 ==========
    function initSmoothScroll() {
        var links = document.querySelectorAll('a[href^="#"]');
        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                var targetId = this.getAttribute('href');
                if (targetId === '#' || targetId === '') return;

                var targetElement = document.querySelector(targetId);
                if (!targetElement) return;

                e.preventDefault();
                smoothScrollTo(targetElement, 500);

                // 更新 URL（不跳转）
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }
            });
        });
    }

    // ========== 平滑滚动到元素 ==========
    function smoothScrollTo(element, duration) {
        var targetPosition = element.offsetTop - 60; // 减去头部高度
        var startPosition = window.scrollY;
        var distance = targetPosition - startPosition;
        var startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var run = easeInOutQuad(timeElapsed, startPosition, distance, duration);

            window.scrollTo(0, run);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    // ========== 缓动函数 ==========
    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    // ========== 防抖函数 ==========
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                func.apply(context, args);
            }, wait);
        };
    }

    // ========== 节流函数 ==========
    function throttle(func, limit) {
        var inThrottle;
        return function() {
            var context = this;
            var args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    // ========== 检测元素是否在视口中 ==========
    function isElementInViewport(el) {
        var rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ========== 添加类名 ==========
    function addClass(element, className) {
        if (!element || !className) return;
        element.classList.add(className);
    }

    // ========== 移除类名 ==========
    function removeClass(element, className) {
        if (!element || !className) return;
        element.classList.remove(className);
    }

    // ========== 切换类名 ==========
    function toggleClass(element, className) {
        if (!element || !className) return;
        element.classList.toggle(className);
    }

    // ========== 获取元素 ==========
    function $(selector) {
        return document.querySelector(selector);
    }

    // ========== 获取所有元素 ==========
    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    // ========== 页面加载完成后初始化 ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========== 导出公共方法（供其他脚本使用） ==========
    window.SmzhbookTheme = {
        toggleMenu: toggleMenu,
        openMenu: openMenu,
        closeMenu: closeMenu,
        isMenuOpen: isMenuOpen,
        smoothScrollTo: smoothScrollTo
    };

})();