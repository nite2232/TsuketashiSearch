document.addEventListener("DOMContentLoaded", () => {
    const newWordInput = document.getElementById("new-word");
    const addWordButton = document.getElementById("add-word");
    const wordList = document.getElementById("word-list");

    // ローカルストレージから選択肢を取得して表示
    function loadWords() {
        chrome.storage.local.get("words", (result) => {
            const words = result.words || [];
            wordList.innerHTML = ""; // 既存リストをクリア

            words.forEach((word, index) => {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <label>
                        <input type="checkbox" data-index="${index}" ${word.checked ? "checked" : ""}>
                        ${word.id}
                    </label>
                    <button class="delete-word" data-index="${index}">削除</button>
                `;
                wordList.appendChild(listItem);
            });

            // チェックボックスの変更を監視
            document.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
                checkbox.addEventListener("change", (event) => {
                    const index = event.target.dataset.index;
                    words[index].checked = event.target.checked;
                    saveWords(words);
                });
            });

            // 削除ボタンの動作
            document.querySelectorAll(".delete-word").forEach((button) => {
                button.addEventListener("click", (event) => {
                    const index = event.target.dataset.index;
                    words.splice(index, 1); // 配列から削除
                    saveWords(words);
                });
            });
        });
    }

    // 新しい単語を追加
    function addNewWord() {
        const newWord = newWordInput.value.trim();
        if (!newWord) {
            return;
        }

        chrome.storage.local.get("words", (result) => {
            const words = result.words || [];
            words.push({ id: newWord, checked: true }); // 新しい単語を追加
            saveWords(words);
            newWordInput.value = ""; // 入力欄をリセット
        });
    }

    // 新しい単語を保存
    function saveWords(words) {
        chrome.storage.local.set({ words }, () => {
            // 背景スクリプトに更新を通知
            chrome.runtime.sendMessage({ type: "updateWords", words }, (response) => {
                if (response.status === "success") {
                    loadWords(); // 表示を更新
                }
            });
        });
    }

    // エンターキーで単語を追加
    newWordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            addNewWord();
        }
    });

    // ボタンのクリックで単語を追加
    addWordButton.addEventListener("click", addNewWord);

    // 初期ロード
    loadWords();
});
