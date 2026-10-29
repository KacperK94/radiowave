# RadioWave — Projekt

## Cel
Przywrócić działanie RadioWave zgodne z funkcjonalnością znaną z fazy testów, bez tworzenia nowej aplikacji i bez usuwania istniejącego odtwarzacza ani funkcji społecznościowych.

## Repozytorium i wdrożenie
- GitHub: https://github.com/KacperK94/radiowave
- Aplikacja: https://radiowave-g81cqpjly-kacper-12de.vercel.app
- Backend Convex: istniejący projekt `radiowave`

## Zakres zachowania z fazy testów
- katalog stacji internetowych i odtwarzanie strumieni;
- wyszukiwanie stacji oraz filtrowanie po gatunku;
- ulubione stacje;
- profil/nick użytkownika;
- panel dodawania własnych stacji;
- shoutbox po skonfigurowaniu Convex;
- odtwarzacz z kontrolkami i animacją winyla.

## Zmiana wdrażana
Katalog jest zasilany przez publiczne Radio Browser API za pośrednictwem endpointu serwerowego `/api/stations`. Endpoint pobiera do 100 popularnych stacji HTTPS, umożliwia wyszukiwanie po nazwie i filtr po tagu/gatunku oraz pomija niedostępne wpisy zwrócone przez katalog. Interfejs zachowuje trzy stacje startowe i stacje dodane lokalnie, a wyniki katalogu dołącza do listy.

## Ograniczenia do dalszej pracy
- ulubione, nick i własne stacje są obecnie zapisane lokalnie w przeglądarce;
- stacje dodane lokalnie nie są jeszcze wspólne dla wszystkich użytkowników;
- shoutbox wymaga poprawnej konfiguracji i wdrożenia funkcji Convex;
- należy sprawdzić build i działanie katalogu po wdrożeniu produkcyjnym.

## Kryteria odbioru
1. Katalog ładuje więcej niż trzy stacje przy dostępnym API.
2. Wyszukiwanie po nazwie działa.
3. Filtr gatunku/tagu działa.
4. Awaria API nie usuwa trzech stacji startowych i pokazuje komunikat.
5. Odtwarzanie, ulubione, profil, panel stacji i shoutbox pozostają dostępne.
