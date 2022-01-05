export const httpErrorCodes = [301, 302, 400, 401, 403, 404, 410, 500, 502, 503, 504];

// eslint-disable-next-line
export const emailLogoBase64 = 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iX3gzMV8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYwLjkgNTguMSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTYwLjkgNTguMTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6IzAxMDEwMTt9DQoJLnN0MXtmaWxsOiMwMDRGOUU7fQ0KPC9zdHlsZT4NCjxnPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik03LjYsNDkuN2wtMC4yLTEuNmgtNGwtMC45LDEuNkgwbDUuNy05LjRoMi41bDEuNSw5LjRINy42eiBNNi42LDQyLjNsLTIuMyw0aDIuOUw2LjYsNDIuM3oiLz4NCgk8cG9seWdvbiBjbGFzcz0ic3QwIiBwb2ludHM9IjEwLjYsNDkuNyAxMi42LDQwLjMgMTQuNCw0MC4zIDEyLjMsNDkuNyAJIi8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE3LjQsNDIuOUwxNi41LDQ3YzAsMC4xLTAuMSwwLjMtMC4xLDAuNGMwLDAuNiwwLjUsMC45LDEuMSwwLjljMC42LDAsMS4yLTAuNCwxLjYtMC44bDEtNC42SDIybC0xLjUsNi44DQoJCWgtMS44bDAuMi0wLjljLTAuNSwwLjUtMS4zLDEuMS0yLjMsMS4xYy0xLjMsMC0yLjEtMC43LTIuMS0xLjdjMC0wLjEsMC0wLjQsMC4xLTAuNWwxLTQuN0gxNy40eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0zMC42LDQ5LjdsMC45LTQuMWMwLTAuMSwwLjEtMC4zLDAuMS0wLjRjMC0wLjUtMC40LTAuOC0xLTAuOGMtMC41LDAtMS4xLDAuNC0xLjQsMC44bC0xLDQuNmgtMS44bDAuOS00LjENCgkJYzAtMC4xLDAuMS0wLjMsMC4xLTAuNWMwLTAuNC0wLjQtMC44LTEtMC44Yy0wLjUsMC0xLjEsMC40LTEuNCwwLjhsLTEsNC42aC0xLjhsMS41LTYuOGgxLjhsLTAuMiwwLjljMC40LTAuNCwxLjEtMS4xLDIuMS0xLjENCgkJYzEuMywwLDEuOSwxLDEuOSwxLjJ2MGMwLjUtMC43LDEuMy0xLjIsMi4zLTEuMmMxLDAsMS45LDAuNiwxLjksMS43YzAsMC4yLDAsMC40LTAuMSwwLjZsLTEsNC43SDMwLjZ6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTM0LjIsNDkuN2wxLjUtNi44aDEuOGwtMS41LDYuOEgzNC4yeiBNMzUuOSw0MS4zYzAtMC44LDAuNy0xLjIsMS4yLTEuMmMwLjYsMCwxLDAuNCwxLDAuOQ0KCQljMCwwLjgtMC43LDEuMi0xLjIsMS4yQzM2LjMsNDIuMiwzNS45LDQxLjgsMzUuOSw0MS4zIi8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyLjMsNDkuN2wwLjktNGMwLTAuMSwwLjEtMC4zLDAuMS0wLjRjMC0wLjYtMC41LTAuOS0xLTAuOWMtMC43LDAtMS4zLDAuNC0xLjcsMC44bC0xLDQuNmgtMS44bDEuNS02LjhINDENCgkJbC0wLjIsMC45YzAuNS0wLjUsMS4zLTEuMSwyLjMtMS4xYzEuMywwLDIuMSwwLjcsMi4xLDEuN2MwLDAuMSwwLDAuNC0wLjEsMC42bC0xLDQuN0g0Mi4zeiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00NS44LDQ5LjdsMS41LTYuOGgxLjhsLTEuNSw2LjhINDUuOHogTTQ3LjUsNDEuM2MwLTAuOCwwLjctMS4yLDEuMi0xLjJjMC42LDAsMSwwLjQsMSwwLjkNCgkJYzAsMC44LTAuNywxLjItMS4yLDEuMkM0Ny45LDQyLjIsNDcuNSw0MS44LDQ3LjUsNDEuMyIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01Mi43LDQyLjlMNTEuNyw0N2MwLDAuMS0wLjEsMC4zLTAuMSwwLjRjMCwwLjYsMC41LDAuOSwxLjEsMC45YzAuNiwwLDEuMi0wLjQsMS42LTAuOGwxLTQuNmgxLjhsLTEuNSw2LjgNCgkJaC0xLjhsMC4yLTAuOWMtMC41LDAuNS0xLjMsMS4xLTIuMywxLjFjLTEuMywwLTIuMS0wLjctMi4xLTEuN2MwLTAuMSwwLTAuNCwwLjEtMC41bDEtNC43SDUyLjd6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTY1LjksNDkuN2wwLjktNC4xYzAtMC4xLDAuMS0wLjMsMC4xLTAuNGMwLTAuNS0wLjQtMC44LTEtMC44Yy0wLjUsMC0xLjEsMC40LTEuNCwwLjhsLTEsNC42aC0xLjhsMC45LTQuMQ0KCQljMC0wLjEsMC4xLTAuMywwLjEtMC41YzAtMC40LTAuNC0wLjgtMS0wLjhjLTAuNSwwLTEuMSwwLjQtMS40LDAuOGwtMSw0LjZoLTEuOGwxLjUtNi44aDEuOGwtMC4yLDAuOWMwLjQtMC40LDEuMS0xLjEsMi4xLTEuMQ0KCQljMS4zLDAsMS45LDEsMS45LDEuMnYwYzAuNS0wLjcsMS4zLTEuMiwyLjMtMS4yYzEsMCwxLjksMC42LDEuOSwxLjdjMCwwLjIsMCwwLjQtMC4xLDAuNmwtMSw0LjdINjUuOXoiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNzMuMSw0OS43bDIuMS05LjRoMy42YzIuMSwwLDQuMSwxLjYsNC4xLDRjMCwyLjUtMS43LDUuMy02LjEsNS4zSDczLjF6IE03Ny4xLDQ3LjljMi4zLDAsMy42LTEuNiwzLjYtMy40DQoJCWMwLTEuNC0xLTIuNC0yLjQtMi40aC0xLjZsLTEuMyw1LjhINzcuMUw3Ny4xLDQ3Ljl6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTgzLjMsNDYuOGMwLTIuMiwxLjctNC4xLDMuOS00LjFjMS43LDAsMywxLjEsMywzYzAsMC40LTAuMSwwLjktMC4xLDEuMWgtNVY0N2MwLDAuNiwwLjYsMS40LDEuOSwxLjQNCgkJYzAuNiwwLDEuMy0wLjIsMS43LTAuNWwwLjYsMS4yYy0wLjcsMC40LTEuNiwwLjctMi40LDAuN0M4NC43LDQ5LjksODMuMyw0OC43LDgzLjMsNDYuOCBNODguNyw0NS43di0wLjFjMC0wLjctMC41LTEuNC0xLjYtMS40DQoJCWMtMSwwLTEuNywwLjgtMS44LDEuNUg4OC43eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik05MS4xLDQ2LjhjMC0yLjIsMS43LTQsMy45LTRjMS40LDAsMi4zLDAuNiwyLjcsMS4zbC0xLjMsMWMtMC4zLTAuNS0wLjgtMC44LTEuNC0wLjhjLTEuMywwLTIuMSwxLjEtMi4xLDIuNA0KCQljMCwxLDAuOCwxLjYsMS43LDEuNmMwLjYsMCwxLjEtMC4zLDEuNC0wLjdsMSwxLjJjLTAuNSwwLjUtMS40LDEuMS0yLjYsMS4xQzkyLjQsNDkuOSw5MS4xLDQ4LjYsOTEuMSw0Ni44Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTk4LjEsNDYuOGMwLTIuMSwxLjYtNCwzLjktNGMyLjIsMCwzLjQsMS4zLDMuNCwzLjFjMCwyLjEtMS42LDQtMy45LDRDOTkuMyw0OS45LDk4LjEsNDguNiw5OC4xLDQ2LjgNCgkJIE0xMDMuNSw0NS45YzAtMS0wLjYtMS42LTEuNi0xLjZjLTEuMiwwLTIsMS4xLTIsMi40YzAsMSwwLjYsMS42LDEuNiwxLjZDMTAyLjcsNDguMywxMDMuNSw0Ny4xLDEwMy41LDQ1LjkiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTA1LjksNDkuN2wxLjUtNi44aDEuOGwtMC4yLDAuOWMwLjYtMC42LDEuMy0xLjEsMi40LTEuMWwtMC40LDEuOGMtMC4xLDAtMC40LTAuMS0wLjYtMC4xDQoJCWMtMC43LDAtMS4zLDAuNC0xLjcsMC44bC0xLDQuNEgxMDUuOXoiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTE0LjQsNDguMWwxLjItMS41YzAuNiwwLjksMS45LDEuNSwzLjIsMS41YzEsMCwxLjQtMC42LDEuNC0xLjFjMC0xLjMtNC41LTEuMS00LjUtMy44YzAtMS41LDEuMy0zLDMuNy0zDQoJCWMxLjUsMCwyLjksMC41LDMuNywxLjVsLTEuMiwxLjRjLTAuNy0wLjgtMS44LTEuMi0yLjgtMS4yYy0wLjcsMC0xLjIsMC40LTEuMiwxYzAsMS4yLDQuNiwxLjEsNC42LDMuOGMwLDEuNy0xLjQsMy4yLTMuNywzLjINCgkJQzExNi44LDQ5LjksMTE1LjIsNDkuMSwxMTQuNCw0OC4xIi8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEyMi41LDUwLjdjMC4yLDAuMSwwLjQsMC4xLDAuNywwLjFjMC40LDAsMC42LTAuMSwwLjgtMC41bDAuNC0wLjZsLTEuMi02LjhoMS45bDAuNyw0LjdsMi44LTQuN2gybC00LjksNy45DQoJCWMtMC43LDEuMi0xLjUsMS42LTIuNiwxLjZjLTAuNCwwLTAuOC0wLjEtMS4xLTAuMkwxMjIuNSw1MC43eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xMjkuNyw0OC42bDEtMS4yYzAuNCwwLjUsMS40LDEuMSwyLjQsMS4xYzAuNiwwLDEtMC40LDEtMC43YzAtMS0zLjQtMC43LTMuNC0yLjhjMC0xLjIsMS0yLjMsMi44LTIuMw0KCQljMS4xLDAsMi4yLDAuNCwyLjksMS4xbC0wLjksMS4xYy0wLjMtMC40LTEuMi0wLjktMi0wLjljLTAuNiwwLTEsMC4zLTEsMC43YzAsMC45LDMuNCwwLjcsMy40LDIuN2MwLDEuMy0xLjEsMi40LTIuOSwyLjQNCgkJQzEzMS42LDQ5LjksMTMwLjQsNDkuNCwxMjkuNyw0OC42Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEzNy4zLDQ4LjRjMC0wLjEsMC0wLjMsMC4xLTAuNWwwLjgtMy41SDEzN2wwLjMtMS41aDEuMWwwLjQtMS45aDEuOGwtMC40LDEuOWgxLjRsLTAuNCwxLjVoLTEuNGwtMC42LDIuOQ0KCQljMCwwLjEsMCwwLjIsMCwwLjNjMCwwLjQsMC4yLDAuNiwwLjcsMC42YzAuMiwwLDAuNC0wLjEsMC41LTAuMWwwLjEsMS40Yy0wLjMsMC4yLTAuNywwLjMtMS4xLDAuMw0KCQlDMTM4LjEsNDkuOSwxMzcuMyw0OS40LDEzNy4zLDQ4LjQiLz4NCgk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMTQxLjYsNDYuOGMwLTIuMiwxLjctNC4xLDMuOS00LjFjMS43LDAsMywxLjEsMywzYzAsMC40LTAuMSwwLjktMC4xLDEuMWgtNVY0N2MwLDAuNiwwLjYsMS40LDEuOSwxLjQNCgkJYzAuNiwwLDEuMy0wLjIsMS43LTAuNWwwLjYsMS4yYy0wLjcsMC40LTEuNiwwLjctMi40LDAuN0MxNDMsNDkuOSwxNDEuNiw0OC43LDE0MS42LDQ2LjggTTE0Nyw0NS43di0wLjFjMC0wLjctMC41LTEuNC0xLjYtMS40DQoJCWMtMSwwLTEuNywwLjgtMS44LDEuNUgxNDd6Ii8+DQoJPHBhdGggY2xhc3M9InN0MCIgZD0iTTE1Ny41LDQ5LjdsMC45LTQuMWMwLTAuMSwwLjEtMC4zLDAuMS0wLjRjMC0wLjUtMC40LTAuOC0xLTAuOGMtMC41LDAtMS4xLDAuNC0xLjQsMC44bC0xLDQuNmgtMS44bDAuOS00LjENCgkJYzAtMC4xLDAuMS0wLjMsMC4xLTAuNWMwLTAuNC0wLjQtMC44LTEtMC44Yy0wLjUsMC0xLjEsMC40LTEuNCwwLjhsLTEsNC42aC0xLjhsMS41LTYuOGgxLjhsLTAuMiwwLjljMC40LTAuNCwxLjEtMS4xLDIuMS0xLjENCgkJYzEuMywwLDEuOSwxLDEuOSwxLjJ2MGMwLjUtMC43LDEuMy0xLjIsMi4zLTEuMmMxLDAsMS45LDAuNiwxLjksMS43YzAsMC4yLDAsMC40LTAuMSwwLjZsLTEsNC43SDE1Ny41eiIvPg0KCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xMDcuOCwxMS45bC00LTVjLTAuMi0wLjItMC40LTAuMy0wLjctMC4zSDU5LjNjLTAuNCwwLTAuOCwwLjMtMC44LDAuN2wtMC40LDIuMWwwLDBsLTQuNywyNC4yDQoJCWMtMC4xLDAuNSwwLjMsMSwwLjgsMWg0My42YzAuMiwwLDAuNC0wLjEsMC41LTAuMmw2LjItNS4yYzAuMi0wLjEsMC4zLTAuMywwLjMtMC41bDIuMS0xMC45bDEtNS4yQzEwOCwxMi40LDEwOCwxMi4xLDEwNy44LDExLjkNCgkJIE04NS40LDEzLjNsLTIuOSwxNS4xYy0wLjEsMC40LTAuNCwwLjctMC44LDAuN2gtMy44Yy0wLjUsMC0wLjktMC41LTAuOC0xbDIuOS0xNS4xYzAuMS0wLjQsMC40LTAuNywwLjgtMC43aDMuOA0KCQlDODUuMSwxMi4yLDg1LjUsMTIuNyw4NS40LDEzLjMgTTE2MC43LDExLjlsLTQtNWMtMC4yLTAuMi0wLjQtMC4zLTAuNy0wLjNoLTM4LjZjLTAuMiwwLTAuNCwwLjEtMC42LDAuMmwtNi4yLDUuMg0KCQljLTAuMiwwLjEtMC4zLDAuMy0wLjMsMC41bC0xLDQuOWMwLDAuMiwwLDAuNSwwLjIsMC43bDQsNWMwLjIsMC4yLDAuNCwwLjMsMC43LDAuM2gyMWMwLjUsMCwwLjksMC41LDAuOCwxbC0wLjgsMy45DQoJCWMtMC4xLDAuNC0wLjQsMC43LTAuOCwwLjdoLTMuOGMtMC41LDAtMC45LTAuNS0wLjgtMWwwLjEtMC44YzAuMS0wLjUtMC4zLTEtMC44LTFoLTIwLjdjLTAuNCwwLTAuOCwwLjMtMC44LDAuN2wtMC4zLDEuNw0KCQljMCwwLjIsMCwwLjUsMC4yLDAuN2w0LDVjMC4yLDAuMiwwLjQsMC4zLDAuNywwLjNoMzguNmMwLjIsMCwwLjQtMC4xLDAuNS0wLjJsNi4yLTUuMmMwLjItMC4xLDAuMy0wLjMsMC4zLTAuNWwxLTQuOQ0KCQljMC0wLjIsMC0wLjUtMC4yLTAuN2wtNC01Yy0wLjItMC4yLTAuNC0wLjMtMC43LTAuM2gtMjFjLTAuNSwwLTAuOS0wLjUtMC44LTFsMC44LTMuOWMwLjEtMC40LDAuNC0wLjcsMC44LTAuN2gzLjgNCgkJYzAuNSwwLDAuOSwwLjUsMC44LDFsLTAuMSwwLjhjLTAuMSwwLjUsMC4zLDEsMC44LDFoMjAuN2MwLjQsMCwwLjgtMC4zLDAuOC0wLjdsMC4zLTEuN0MxNjEsMTIuNCwxNjAuOSwxMi4xLDE2MC43LDExLjkNCgkJIE01NC41LDExLjlsLTQtNWMtMC4yLTAuMi0wLjQtMC4zLTAuNy0wLjNIMTEuMmMtMC4yLDAtMC40LDAuMS0wLjYsMC4yTDQuNCwxMmMtMC4yLDAuMS0wLjMsMC4zLTAuMywwLjVMMCwzMy43DQoJCWMtMC4xLDAuNSwwLjMsMSwwLjgsMWgyMC43YzAuNCwwLDAuOC0wLjMsMC44LTAuN2wwLjgtNC4yYzAuMS0wLjQsMC40LTAuNywwLjgtMC43aDMuOGMwLjUsMCwwLjksMC41LDAuOCwxbC0wLjcsMy42DQoJCWMtMC4xLDAuNSwwLjMsMSwwLjgsMWgyMC43YzAuNCwwLDAuOC0wLjMsMC44LTAuN2w0LjItMjEuNEM1NC43LDEyLjQsNTQuNiwxMi4xLDU0LjUsMTEuOSBNMzIsMTMuM2wtMS45LDkuNQ0KCQljLTAuMSwwLjQtMC40LDAuNy0wLjgsMC43aC0zLjhjLTAuNSwwLTAuOS0wLjUtMC44LTFsMS45LTkuNWMwLjEtMC40LDAuNC0wLjcsMC44LTAuN2gzLjhDMzEuNywxMi4yLDMyLjIsMTIuNywzMiwxMy4zIi8+DQo8L2c+DQo8L3N2Zz4NCg==';

export const jwtExpiresShort = '1d';
export const jwtExpiresLong = '36500d';

export const squareMillimetersValue = 1000000;


/**
 *  Constants based on JSON file and config values
*/

export const ADSSystemTypes = ['extendable', 'opening', 'suspended', 'assembling', 'monorail', 'hinged'];

export const listOfItemsTypes = ['Профиль', 'Фурнитура', 'Наполнение', 'Услуга к наполнению', 'Другое'];

export const mechanismArticlesCodes = [
  'вт_1', 'вт_2', 'сил_1', 'сил_2', 'під_1', 'під_2', 'R-219_сил', 'сил_207_1', 'кріп_комп_склад', '10100217301',
  'кріп_відкр', 'WM-10145 кріп_відкр', 'дотяг_Tutti', '2_двер_Tutti', '3_двер_Tutti',
];

export const doorLatchMechanismsArticles = ['дотяг_низ', 'дотяг_верх_OPK'];

// ! Note: 419с is written in Cyrillic in 1C
export const ADSSideProfilesList = [
  '117', '06', '07', '119', '119-v.p.', '119 v.p.', '120', '219', '207',
  'Slim', '119-L', '119-v.p.', '419', '419с', '20', '21', '22', '220',
];

export const sideProfilesBySystemType = {
  extendable: ['117', '06', '07', '119', '120', '219', '207', 'Slim', '119-L', '119-v.p.', '20', '21', '22', '220'],
  opening: ['07', '119'],
  suspended: [],
  assembling: ['07', '119'],
  monorail: ['117', '06', '07', '119', '120', '207', 'Slim', '119-L', '119-v.p.', '20', '21', '22', '220'],
  hinged: ['419'],
};

export const connectingProfilesBySystemType = {
  extendable: ['03', '03-L', '31', '32', '231', 'Slim 03'],
  opening: ['03', '31', '32'],
  suspended: [],
  assembling: ['03', '31', '32'],
  monorail: ['03', '03-L', '31', '32', '231', 'Slim 03'],
  hinged: ['403', '431'],
};

export const regionsList = ['Львов', 'Киев', 'Харьков', 'Одесса'];

export const defaultRegion = 'Львов';

export const defaultPackageName = 'Розничная';

export const defaultPackagesByRegion = [
  {
    region: 'Львов',
    packageName: 'Розничная',
  }, {
    region: 'Киев',
    packageName: 'КиевРозничная',
  }, {
    region: 'Харьков',
    packageName: 'ХарьковРозничная',
  }, {
    region: 'Одесса',
    packageName: 'ОдессаРозничная',
  },
];

export const regionsValuesList = [
  { label: 'Львов', value: 'lviv' },
  { label: 'Киев', value: 'kyiv' },
  { label: 'Харьков', value: 'kharkiv' },
  { label: 'Одесса', value: 'odesa' },
];

export const orderTypes = {
  'doors-with-assembling': 'D - Двери',
  'doors-without-assembling': 'Порізка',
};

export const openingSidesSystems = ['opening', 'assembling'];

export const ordersStatuses = [
  { // Не збережене замовлення
    value: 'draft',
    labelUk: 'Драфт',
    labelRu: 'Драфт',
  },
  { // Нове замовлення, збережене і поки не віддане в роботу
    value: 'new',
    labelUk: 'Збережено',
    labelRu: 'Сохранено',
  },
  { // Це статус який присвоюється автоматично калькулятором, до того часу, доки не прийшла перша відповідь з 1C
    value: 'in-processing',
    labelUk: 'На опрацюванні',
    labelRu: 'В обработке',
  },
  { // 1C віддає цей статус, коли всі матеріали є в наявності і замовлення не потребує уточнення з менеджером
    value: 'processed-and-available-for-payment',
    labelUk: 'Опрацьовано, доступний для оплати',
    labelRu: 'Обработано, доступно для оплаты',
  },
  { // Менеджер уточнює з клієнтом певні нюанси, макети і т.п.
    // після уточнення усіх нюансів менеджер змінює статус на "Опрацьовано, доступний для оплати" і передає на сайт
    value: 'clarification-of-order-parameters',
    labelUk: 'Уточнення з менеджером параметрів замовлення',
    labelRu: 'Уточнение с менеджером параметров заказа',
  },
  { // та ж ситуація тільки уточнення по певних номенклатурних позиціях
    value: 'clarification-of-order-components',
    labelUk: 'Уточнення з менеджером комплектуючих',
    labelRu: 'Уточнение с менеджером комплектующих',
  },
  {
    value: 'launched-in-work',
    labelUk: 'Запущено в роботу',
    labelRu: 'Запущено в работу',
  },
  {
    value: 'manufactured-in-lviv',
    labelUk: 'Замовлення виготовлено (Виробництво м. Львів)',
    labelRu: 'Заказ изготовлено (Производство г. Львов)',
  },
  {
    value: 'available-at-the-delivery-point',
    labelUk: 'Доступний у точці видачі',
    labelRu: 'Доступен в точке выдачи',
  },
  {
    value: 'dispatched',
    labelUk: 'Відвантажено',
    labelRu: 'Отгружено',
  },
  {
    value: 'declined',
    labelUk: 'Замовлення скасовано',
    labelRu: 'Заказ отменен',
  },
];


export const systemTypes = [
  {
    value: 'extendable',
    labelUk: 'Розсувна',
    labelRu: 'Раздвижная',
  },
  {
    value: 'opening',
    labelUk: 'Відкривна',
    labelRu: 'Открывающаяся',
  },
  {
    value: 'suspended',
    labelUk: 'Підвісна',
    labelRu: 'Подвесная',
  },
  {
    value: 'assembling',
    labelUk: 'Складальна',
    labelRu: 'Сборочная',
  },
  {
    value: 'monorail',
    labelUk: 'Монорельс',
    labelRu: 'Монорельс',
  },
  {
    value: 'hinged',
    labelUk: 'Навісна',
    labelRu: 'Навесная',
  },
  {
    value: 'frame-facades',
    labelUk: 'Рамкові фасади',
    labelRu: 'Рамковые фасады',
  },
];


/**
 * PDF constants
 */

export const LOGO_PATH = './src/client/assets/images/logo-pdf.png';

export const PDF_SCALE_SM = 10;

export const PDF_SCALE_LG = 20;

export const GRAY_COLOR = '#ededed';

export const PDF_ICONS = [
  { name: 'leftArrow', icon: '' },
  { name: 'rightArrow', icon: '' },
  { name: 'doorLatchMechanism', icon: '' },
];

export const PDF_FONTS = {
  Roboto: {
    normal: './src/client/assets/fonts/OpenSans-Regular.ttf',
    bold: './src/client/assets/fonts/OpenSans-Bold.ttf',
  },
  Fontello: {
    normal: './src/client/assets/fonts/Fontello.ttf',
    bold: './src/client/assets/fonts/Fontello.ttf',
    italics: './src/client/assets/fonts/Fontello.ttf',
    bolditalics: './src/client/assets/fonts/Fontello.ttf',
  },
};
