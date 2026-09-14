/**
 * VitePress 风格主题 JavaScript
 * 提供交互功能：菜单切换、搜索、目录高亮、平滑滚动、亮/暗主题切换、
 * Mermaid 图表点击放大等
 */

(function() {
    'use strict';

    // ========== 全局变量 ==========
    var sidebar = null;
    var menuToggle = null;
    var sidebarBackdrop = null;
    var searchModal = null;
    var searchButton = null;
    var searchInput = null;
    var searchModalBackdrop = null;
    var searchCloseBtn = null;
    var searchDebounceTimer = null;

    // ========== 初始化 ==========
    function init() {
        initElements();
        bindEvents();
        initSidebarToggle();
        initActiveSidebarHighlight();
        initSearch();
        initTocHighlight();
        initSmoothScroll();
        initKeyboardShortcuts();
        initThemeToggle();
        initMermaidZoom();
    }

    // ========== 初始化 DOM 元素引用 ==========
    function initElements() {
        sidebar = document.getElementById('vp-sidebar');
        menuToggle = document.querySelector('.vp-menu-toggle');
        if (sidebar) {
            sidebarBackdrop = sidebar.querySelector('.vp-sidebar-backdrop');
        }
        // 搜索相关元素
        searchModal = document.getElementById('mkdocs-search-modal');
        searchButton = document.querySelector('.vp-search-button');
        searchInput = document.getElementById('mkdocs-search-query');
        if (searchModal) {
            searchModalBackdrop = searchModal.querySelector('.vp-search-modal-backdrop');
            searchCloseBtn = searchModal.querySelector('.vp-search-modal-close');
        }
    }

    // ========== 绑定事件 ==========
    function bindEvents() {
        // 移动端菜单切换
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }

        // 点击背景关闭侧边栏
        if (sidebarBackdrop) {
            sidebarBackdrop.addEventListener('click', closeMenu);
        }

        // 搜索按钮点击
        if (searchButton) {
            searchButton.addEventListener('click', openSearchModal);
        }

        // 搜索弹窗背景点击关闭
        if (searchModalBackdrop) {
            searchModalBackdrop.addEventListener('click', closeSearchModal);
        }

        // 搜索关闭按钮
        if (searchCloseBtn) {
            searchCloseBtn.addEventListener('click', closeSearchModal);
        }

        // 搜索输入框 - 触发搜索
        if (searchInput) {
            searchInput.addEventListener("keyup", doSearch);
        }

        // 窗口大小改变时处理
        window.addEventListener('resize', debounce(function() {
            if (window.innerWidth > 960) {
                closeMenu();
            }
        }, 100));

        // 键盘事件
        document.addEventListener('keydown', handleKeydown);
    }

    // ========== 切换菜单 ==========
    function toggleMenu() {
        if (!sidebar) return;

        if (sidebar.classList.contains('open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    // ========== 打开菜单 ==========
    function openMenu() {
        if (!sidebar) return;

        sidebar.classList.add('open');
        document.body.style.overflow = 'hidden';

        // 添加动画效果
        if (menuToggle) {
            menuToggle.classList.add('active');
        }
    }

    // ========== 关闭菜单 ==========
    function closeMenu() {
        if (!sidebar) return;

        sidebar.classList.remove('open');
        document.body.style.overflow = '';

        if (menuToggle) {
            menuToggle.classList.remove('active');
        }
    }

    // ========== 检查菜单是否打开 ==========
    function isMenuOpen() {
        return sidebar && sidebar.classList.contains('open');
    }

    // ========== 侧边栏折叠/展开切换 ==========
    function initSidebarToggle() {
        var toggleButtons = document.querySelectorAll('.vp-sidebar-toggle');
        toggleButtons.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var listItem = btn.closest('.vp-sidebar-item-collapsible');
                if (listItem) {
                    listItem.classList.toggle('open');
                }
            });
        });
    }

    // ========== 高亮当前激活的侧边栏项 ==========
    function initActiveSidebarHighlight() {
        // 默认展开1-3级导航项
        var collapsibleItems = document.querySelectorAll('.vp-sidebar-item-collapsible');
        collapsibleItems.forEach(function(item) {
            if (item.classList.contains('vp-sidebar-level-1') ||
                item.classList.contains('vp-sidebar-level-2') ||
                item.classList.contains('vp-sidebar-level-3')) {
                item.classList.add('open');
            }
        });

        // 确保激活项的所有父级也展开
        var activeItems = document.querySelectorAll('.vp-sidebar-item.active');
        activeItems.forEach(function(activeItem) {
            var parent = activeItem.parentElement;
            while (parent) {
                if (parent.classList && parent.classList.contains('vp-sidebar-item-collapsible')) {
                    parent.classList.add('open');
                }
                parent = parent.parentElement;
                if (parent && parent.id === 'vp-sidebar') break;
            }
        });
    }

    // ========== 键盘快捷键 ==========
    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Ctrl+K 或 Cmd+K 打开搜索弹窗
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openSearchModal();
            }
        });
    }

    function handleKeydown(e) {
        // ESC 键关闭菜单和搜索弹窗
        if (e.key === 'Escape') {
            if (isMenuOpen()) {
                closeMenu();
            }
            if (isSearchModalOpen()) {
                closeSearchModal();
            }
        }
    }

    // ========== 搜索弹窗控制 ==========
    function openSearchModal() {
        if (!searchModal) return;
        
        searchModal.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // 延迟聚焦输入框，确保弹窗显示后再聚焦
        setTimeout(function() {
            if (searchInput) {
                searchInput.focus();
            }
        }, 100);
    }

    function closeSearchModal() {
        if (!searchModal) return;
        
        searchModal.classList.remove('open');
        document.body.style.overflow = '';
        
        // 清空搜索框和结果
        if (searchInput) {
            searchInput.value = '';
        }
        clearSearchResults();
    }

    function isSearchModalOpen() {
        return searchModal && searchModal.classList.contains('open');
    }

    // ========== 聚焦搜索框 ==========
    function focusSearch() {
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    // ========== 清空搜索结果 ==========
    function clearSearchResults() {
        var resultsEmpty = document.querySelector('.vp-search-modal-results-empty');
        var resultsList = document.querySelector('.vp-search-modal-results-list');
        var resultsCount = document.querySelector('.vp-search-modal-results-count');
        
        if (resultsEmpty) {
            resultsEmpty.style.display = 'block';
            resultsEmpty.querySelector('p').textContent = '输入关键词开始搜索';
        }
        if (resultsList) {
            resultsList.style.display = 'none';
        }
        if (resultsCount) {
            resultsCount.textContent = '';
        }
    }

    // ========== 初始化搜索功能 ==========
    function initSearch() {
        // MkDocs search 插件会在 #mkdocs-search-results 中写入结果
        // 我们需要监听这个变化并复制到弹窗中
        var targetElement = document.getElementById('mkdocs-search-results');
        if (!targetElement) return;
        
        // 使用 MutationObserver 监听搜索结果变化
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    copySearchResultsToModal();
                }
            });
        });
        
        observer.observe(targetElement, { 
            childList: true,
            subtree: true 
        });
    }

    // ========== 复制搜索结果到弹窗 ==========
    function copySearchResultsToModal() {
        var mkdocsResults = document.getElementById('mkdocs-search-results');
        if (!mkdocsResults) return;
        
        var resultsEmpty = document.querySelector('.vp-search-modal-results-empty');
        var resultsList = document.querySelector('.vp-search-modal-results-list');
        var resultsCount = document.querySelector('.vp-search-modal-results-count');
        var searchQuery = document.getElementById('mkdocs-search-query');
        
        if (!resultsEmpty || !resultsList) return;
        
        var query = searchQuery ? searchQuery.value : '';
        var hasResults = mkdocsResults.querySelector('.has-results');
        var noResults = mkdocsResults.querySelector('.no-results');
        var articles = mkdocsResults.querySelectorAll('article');
        
        if (articles && articles.length > 0) {
            // 有结果
            var html = '';
            articles.forEach(function(article) {
                html += '<li>' + article.innerHTML + '</li>';
            });
            
            resultsEmpty.style.display = 'none';
            resultsList.style.display = 'block';
            
            if (resultsCount) {
                resultsCount.textContent = articles.length + ' 个结果';
            }
            
            resultsList.querySelector('.vp-search-results-list').innerHTML = html;
        } else if (noResults || (query && query.length >= 3)) {
            // 无结果
            resultsEmpty.style.display = 'block';
            resultsEmpty.querySelector('p').textContent = '没有找到匹配 "' + query + '" 的结果';
            resultsList.style.display = 'none';
        }
    }

    // ========== 初始化目录高亮 ==========
    function initTocHighlight() {
        var outlineLinks = document.querySelectorAll('.vp-outline-link');
        if (outlineLinks.length === 0) return;

        var headings = [];
        outlineLinks.forEach(function(link) {
            var targetId = link.getAttribute('href');
            if (!targetId || targetId === '#') return;

            // 处理以数字开头的 ID (CSS 选择器不支持以数字开头的 ID)
            var selector = targetId.startsWith('#') ? targetId : '#' + targetId;
            var targetElement;
            try {
                targetElement = document.querySelector(selector);
            } catch (e) {
                // 如果选择器无效，尝试转义
                try {
                    var escapedId = CSS.escape(targetId.substring(1));
                    targetElement = document.getElementById(escapedId);
                } catch (e2) {
                    targetElement = null;
                }
            }
            if (targetElement) {
                headings.push({
                    link: link,
                    element: targetElement,
                    top: 0
                });
            }
        });

        if (headings.length === 0) return;

        // 滚动时高亮当前目录项
        var ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    highlightCurrentTocItem(headings);
                    ticking = false;
                });
                ticking = true;
            }
        });

        // 初始高亮
        highlightCurrentTocItem(headings);
    }

    // ========== 高亮当前目录项 ==========
    function highlightCurrentTocItem(headings) {
        var scrollPos = window.scrollY + 100;
        var activeIndex = -1;

        headings.forEach(function(heading, index) {
            var elementTop = heading.element.offsetTop;
            var elementBottom = elementTop + heading.element.offsetHeight;

            if (scrollPos >= elementTop && scrollPos < elementBottom) {
                activeIndex = index;
            }

            // 重置样式
            heading.link.classList.remove('active');
        });

        // 如果没有找到精确匹配，找最近的上方标题
        if (activeIndex === -1) {
            for (var i = headings.length - 1; i >= 0; i--) {
                if (scrollPos >= headings[i].element.offsetTop) {
                    activeIndex = i;
                    break;
                }
            }
        }

        // 高亮当前项
        if (activeIndex >= 0 && headings[activeIndex]) {
            headings[activeIndex].link.classList.add('active');
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

                // 移动端：关闭菜单后滚动
                if (isMenuOpen()) {
                    closeMenu();
                }
            });
        });
    }

    // ========== 平滑滚动到元素 ==========
    function smoothScrollTo(element, duration) {
        // 导航栏高度取自 CSS 变量，避免与 --vp-nav-height 不同步
        var navHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height'), 10
        ) || 60;
        var targetPosition = element.offsetTop - navHeight - 20;
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

    // ========== 亮 / 暗主题切换 ==========
    // 首屏主题由 base.html <head> 内的内联脚本提前应用（避免白闪），
    // 这里只负责：同步按钮状态、响应点击、持久化选择、重绘 mermaid 图。
    var THEME_STORAGE_KEY = 'smzh-theme';
    var themeToggle = null;

    function getSavedTheme() {
        try {
            var saved = localStorage.getItem(THEME_STORAGE_KEY);
            if (saved === 'light' || saved === 'dark') return saved;
        } catch (e) { /* localStorage 不可用（隐私模式等）时忽略 */ }
        return null;
    }

    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    function getCurrentTheme() {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }

    // 重绘 mermaid 图（弹窗开着时先把 SVG 移回原容器）
    function rerenderMermaid() {
        if (typeof window.smzhRenderMermaid !== 'function') return;
        if (isMermaidZoomOpen()) closeMermaidZoom();
        window.smzhRenderMermaid();
    }

    // 应用主题；save 为 true 时写入 localStorage 并重绘 mermaid 图
    // （mermaid 的 default / dark 是两套配色，只能重新渲染，不能靠 CSS 覆盖）
    function applyTheme(theme, save) {
        document.documentElement.classList.toggle('dark', theme === 'dark');

        if (themeToggle) {
            var label = theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式';
            themeToggle.title = label;
            themeToggle.setAttribute('aria-label', label);
        }

        if (save) {
            try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch (e) {}
            rerenderMermaid();
        }
    }

    function setTheme(theme) {
        applyTheme(theme === 'dark' ? 'dark' : 'light', true);
    }

    function toggleTheme() {
        setTheme(getCurrentTheme() === 'dark' ? 'light' : 'dark');
    }

    function initThemeToggle() {
        themeToggle = document.querySelector('.vp-theme-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', toggleTheme);
        }

        // 首屏主题已由 base.html <head> 内联脚本应用，这里只同步按钮文案
        applyTheme(getCurrentTheme(), false);

        // 用户未手动选择过主题时，跟随系统亮/暗变化
        if (window.matchMedia) {
            var mq = window.matchMedia('(prefers-color-scheme: dark)');
            var onSystemChange = function() {
                if (getSavedTheme()) return;   // 已手动选择，不再跟随系统
                applyTheme(getSystemTheme(), false);
                rerenderMermaid();
            };
            if (mq.addEventListener) {
                mq.addEventListener('change', onSystemChange);
            } else if (mq.addListener) {
                mq.addListener(onSystemChange);   // 旧版 Safari
            }
        }
    }

    // ========== Mermaid 图表点击放大 ==========
    // 点击图表弹出全屏弹窗：滚轮缩放（1~4 倍，指针位置锚定）、拖拽平移，
    // Esc / 点击遮罩 / 关闭按钮关闭。用 document 级事件委托，
    // 与 mermaid 的异步渲染解耦（点击发生时 SVG 必然已存在）。
    var MZ_MIN_SCALE = 1;
    var MZ_MAX_SCALE = 4;
    var MZ_ZOOM_STEP = 1.15;
    var MZ_DBL_SCALE = 2.5;

    var mzModal = null;
    var mzBackdrop = null;
    var mzCloseBtn = null;
    var mzStage = null;
    var mzStageInner = null;
    var mzSvg = null;          // 弹窗中的 svg
    var mzHost = null;         // svg 的原宿主 .mermaid
    var mzSavedFocus = null;
    var mzScale = 1;
    var mzBaseWidth = 0;       // scale=1 时 svg 在弹窗内的宽度（缩放基准）
    var mzDragging = false;
    var mzStartX = 0;
    var mzStartY = 0;
    var mzScrollLeft = 0;
    var mzScrollTop = 0;

    function buildMermaidZoomModal() {
        if (mzModal) return;

        mzModal = document.createElement('div');
        mzModal.className = 'mz-modal';
        mzModal.setAttribute('role', 'dialog');
        mzModal.setAttribute('aria-modal', 'true');
        mzModal.setAttribute('aria-label', '图表放大查看');

        mzBackdrop = document.createElement('div');
        mzBackdrop.className = 'mz-modal-backdrop';

        var panel = document.createElement('div');
        panel.className = 'mz-modal-panel';

        mzCloseBtn = document.createElement('button');
        mzCloseBtn.className = 'mz-modal-close';
        mzCloseBtn.type = 'button';
        mzCloseBtn.setAttribute('aria-label', '关闭');
        mzCloseBtn.textContent = '✕';

        mzStage = document.createElement('div');
        mzStage.className = 'mz-stage';
        mzStage.tabIndex = -1;

        mzStageInner = document.createElement('div');
        mzStageInner.className = 'mz-stage-inner';
        mzStage.appendChild(mzStageInner);

        panel.appendChild(mzCloseBtn);
        panel.appendChild(mzStage);
        mzModal.appendChild(mzBackdrop);
        mzModal.appendChild(panel);
        document.body.appendChild(mzModal);

        mzBackdrop.addEventListener('click', function(e) {
            if (e.target === mzBackdrop) closeMermaidZoom();
        });
        mzCloseBtn.addEventListener('click', closeMermaidZoom);
        mzStage.addEventListener('wheel', onMermaidZoomWheel, { passive: false });
        mzStage.addEventListener('pointerdown', onMermaidZoomPointerDown);
        mzStage.addEventListener('pointermove', onMermaidZoomPointerMove);
        mzStage.addEventListener('pointerup', onMermaidZoomPointerUp);
        mzStage.addEventListener('pointercancel', onMermaidZoomPointerUp);
        mzStage.addEventListener('dblclick', onMermaidZoomDblClick);
    }

    function isMermaidZoomOpen() {
        return mzSvg !== null;
    }

    function openMermaidZoom(svg) {
        if (mzSvg) return;   // 已打开
        mzHost = svg.closest('.mermaid');
        buildMermaidZoomModal();

        mzSavedFocus = document.activeElement;
        mzSvg = svg;
        mzScale = 1;
        mzStage.scrollLeft = 0;
        mzStage.scrollTop = 0;
        mzStage.classList.remove('mz-scaled');
        mzStageInner.appendChild(svg);   // 移动而非克隆：保持 SVG 内部 id 唯一
        mzBaseWidth = svg.getBoundingClientRect().width;   // 弹窗内自适应后的基准宽度

        if (mzHost) mzHost.classList.add('mz-hidden');
        mzModal.classList.add('mz-open');
        document.documentElement.classList.add('mz-lock');   // 锁背景滚动
        mzStage.focus();
    }

    function closeMermaidZoom() {
        if (!mzSvg) return;

        mzStage.classList.remove('mz-scaled');
        mzSvg.style.width = '';   // 还原内联宽度

        if (mzHost) {
            mzHost.appendChild(mzSvg);   // 移回原位
            mzHost.classList.remove('mz-hidden');
        }

        mzSvg = null;
        mzHost = null;
        mzModal.classList.remove('mz-open');
        document.documentElement.classList.remove('mz-lock');

        if (mzSavedFocus && mzSavedFocus.focus) mzSavedFocus.focus();   // 恢复焦点
        mzSavedFocus = null;
    }

    // 应用缩放：显式设置 svg 宽度，>1 时放开 max-width 限制让滚动条扩展
    function setMermaidZoomScale(next) {
        if (next === mzScale) return;

        if (next > 1) {
            mzStage.classList.add('mz-scaled');
            mzSvg.style.width = Math.round(mzBaseWidth * next) + 'px';
        } else {
            mzStage.classList.remove('mz-scaled');
            mzSvg.style.width = '';
        }
        mzScale = next;
    }

    // 滚轮缩放：指针位置锚定，缩放前后光标下的内容点保持不动
    function onMermaidZoomWheel(e) {
        if (!mzSvg) return;
        e.preventDefault();

        var factor = e.deltaY < 0 ? MZ_ZOOM_STEP : 1 / MZ_ZOOM_STEP;
        var next = Math.min(MZ_MAX_SCALE, Math.max(MZ_MIN_SCALE, mzScale * factor));
        if (next === mzScale) return;

        var rect = mzStage.getBoundingClientRect();
        var mx = e.clientX - rect.left;
        var my = e.clientY - rect.top;
        setMermaidZoomScale(next);
        mzStage.scrollLeft = ((mx + mzStage.scrollLeft) * next / mzScale) - mx;
        mzStage.scrollTop = ((my + mzStage.scrollTop) * next / mzScale) - my;
    }

    // 拖拽平移（仅放大后启用）：直接改 scrollLeft/Top，与滚动条同源
    function onMermaidZoomPointerDown(e) {
        if (!mzSvg || mzScale <= 1) return;
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        mzDragging = true;
        mzStartX = e.clientX;
        mzStartY = e.clientY;
        mzScrollLeft = mzStage.scrollLeft;
        mzScrollTop = mzStage.scrollTop;
        mzStage.classList.add('mz-dragging');
        if (mzStage.setPointerCapture) mzStage.setPointerCapture(e.pointerId);
        e.preventDefault();
    }

    function onMermaidZoomPointerMove(e) {
        if (!mzDragging) return;
        mzStage.scrollLeft = mzScrollLeft - (e.clientX - mzStartX);
        mzStage.scrollTop = mzScrollTop - (e.clientY - mzStartY);
    }

    function onMermaidZoomPointerUp(e) {
        if (!mzDragging) return;
        mzDragging = false;
        mzStage.classList.remove('mz-dragging');
        if (mzStage.releasePointerCapture) mzStage.releasePointerCapture(e.pointerId);
    }

    // 触摸设备：双击在 1x 与 2.5x 间切换（滚轮的替代交互）
    function onMermaidZoomDblClick(e) {
        if (!mzSvg) return;
        e.preventDefault();

        var next = mzScale > 1 ? MZ_MIN_SCALE : MZ_DBL_SCALE;
        var rect = mzStage.getBoundingClientRect();
        var cx = rect.width / 2;
        var cy = rect.height / 2;
        setMermaidZoomScale(next);
        mzStage.scrollLeft = ((cx + mzStage.scrollLeft) * next / mzScale) - cx;
        mzStage.scrollTop = ((cy + mzStage.scrollTop) * next / mzScale) - cy;
    }

    function initMermaidZoom() {
        // 全局委托：点击图表打开（mermaid 异步渲染后依然有效）
        document.addEventListener('click', function(e) {
            if (mzSvg) return;                     // 弹窗已打开
            var target = e.target;
            if (!target.closest) return;
            if (target.closest('.mz-modal')) return;   // 弹窗内部
            var svg = target.closest('.mermaid svg');
            if (!svg) return;
            if (svg.closest('a')) return;          // 图内链接交给浏览器
            e.preventDefault();
            openMermaidZoom(svg);
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMermaidZoomOpen()) closeMermaidZoom();
        });
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
        focusSearch: focusSearch,
        smoothScrollTo: smoothScrollTo,
        openSearchModal: openSearchModal,
        closeSearchModal: closeSearchModal,
        isSearchModalOpen: isSearchModalOpen,
        // 亮/暗主题
        getTheme: getCurrentTheme,
        setTheme: setTheme,
        toggleTheme: toggleTheme,
        // Mermaid 放大
        openMermaidZoom: openMermaidZoom,
        closeMermaidZoom: closeMermaidZoom,
        isMermaidZoomOpen: isMermaidZoomOpen
    };

})();
