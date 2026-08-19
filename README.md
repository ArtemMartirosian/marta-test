# Marta — подсветка этажа

Demo: будет добавлено после публикации.  
Repository: исходный код находится в этом проекте.

## Запуск
`npm ci`  
`npm run dev`  
`npm run build`

## Подход
- JPEG лежит под прозрачным React Three Fiber canvas; оба слоя используют один centered `cover`-crop.
- Камеры хранятся без преобразований: Unreal, сантиметры, Pitch/Yaw/Roll в градусах, focal length в мм.
- Код переводит UE X-forward/Y-right/Z-up в Three по forward/up векторам.
- Vertical FOV считается из filmback height 13.365 мм; ширина матрицы не используется.
- FBX не центрируется, не вращается и не масштабируется; одна позиция используется во всех кадрах.
- Mouse hover и touch selection работают через единые Pointer Events.

## Калибровка
- Положение искал на первом кадре dev-регуляторами XYZ при полупрозрачной геометрии.
- Получено: `x=10800`, `y=150`, `z=7800` в сантиметровых scene units.
- Второй кадр проверен заменой только JPEG и параметров камеры.

## Масштабирование
- Для 40 кадров добавляются записи config; текущий и соседние JPEG предзагружаются.
- При новом рендере обновляются JPEG, его размеры и camera config; позиция модели остаётся общей.
- Видеопереход: MP4/WebM или image sequence с синхронным camera timeline; hit geometry остаётся в world scene.

## AI
- AI использован для scaffolding, проверки camera math и QA-чеклиста.
- Вручную проверены camera axes/FOV, XYZ-калибровка, resize, URL-state и touch-поведение.

Допущение: optical center совпадает с центром JPEG, а FBXLoader сохраняет естественные оси и единицы ассета.
