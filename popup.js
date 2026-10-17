document.getElementById('translateBtn').addEventListener('click', async () => {
  const text = document.getElementById('plText').value.trim();
  const statusDiv = document.getElementById('status');

  if (!text) {
    statusDiv.innerText = "Wpisz jakiś tekst!";
    return;
  }

  statusDiv.innerText = "Tłumaczenie...";

  try {
    // Zapytanie do darmowego API MyMemory
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=pl|en`);
    const data = await response.json();
    const translatedText = data.responseData.translatedText;

    statusDiv.innerText = "Wklejanie...";

    // Pobieramy aktywną kartę przeglądarki i wykonujemy skrypt wklejający
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: pasteTextToActiveElement,
      args: [translatedText]
    });

    statusDiv.innerText = "Gotowe! ✨";
    document.getElementById('plText').value = '';
  } catch (err) {
    console.error(err);
    statusDiv.innerText = "Błąd tłumaczenia!";
  }
});

// Funkcja wykonywana bezpośrednio na otwartej stronie
function pasteTextToActiveElement(textToPaste) {
  const el = document.activeElement;

  if (!el) {
    alert("Nie znaleziono aktywnego pola tekstowego!");
    return;
  }

  // Obsługa standardowych pól input oraz textarea
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;
    const val = el.value;
    el.value = val.substring(0, start) + textToPaste + val.substring(end);
    el.selectionStart = el.selectionEnd = start + textToPaste.length;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  } 
  // Obsługa edytowalnych elementów (np. czat Discorda, Messengera itp.)
  else if (el.isContentEditable) {
    document.execCommand('insertText', false, textToPaste);
  } else {
    alert("Kliknij najpierw w pole tekstowe na stronie!");
  }
}
