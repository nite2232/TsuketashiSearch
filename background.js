'use strict';

// デフォルトの選択肢
const defaultWords = [
    { id: 'とは', checked: true },
    { id: '意味', checked: true },
    { id: '類語', checked: true },
    { id: '英語', checked: false },
    { id: '日本語', checked: false },
    { id: '歌詞', checked: true },
    { id: '評判', checked: true },
    { id: 'レビュー', checked: true },
    { id: '値段', checked: false },
    { id: 'いつまで', checked: true },
    { id: 'なぜ', checked: true },
    { id: '使い方', checked: true },
    { id: '解説', checked: false },
    { id: '攻略', checked: false },
];

// ローカルストレージから選択肢を取得
function getWords(callback) {
    chrome.storage.local.get({ words: defaultWords }, (result) => {
        callback(result.words);
    });
}

// ローカルストレージに選択肢を保存
function saveWords(words) {
    chrome.storage.local.set({ words });
}

// 右クリックメニューを更新
function updateContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'custom-search-parent',
            title: 'つけたし検索',
            contexts: ["selection"]
        });

        getWords((words) => {
            words.forEach((word) => {
                if (word.checked) {
                    chrome.contextMenus.create({
                        id: word.id,
                        title: word.id,
                        parentId: 'custom-search-parent',
                        contexts: ["selection"]
                    });
                }
            });
        });
    });
}

// 初期化
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ words: defaultWords }, () => {
        updateContextMenu();
    });
});

// メニューがクリックされたときの動作
chrome.contextMenus.onClicked.addListener((info) => {
    const baseUrl = "https://www.google.com/search?q=";
    let searchQuery = info.selectionText;

    chrome.tabs.create({
        url: baseUrl + encodeURIComponent(`${searchQuery} ${info.menuItemId}`)
    });
});

// メッセージリスナーでポップアップと通信
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'updateWords') {
        saveWords(message.words);
        updateContextMenu();
        sendResponse({ status: 'success' });
    }
});
