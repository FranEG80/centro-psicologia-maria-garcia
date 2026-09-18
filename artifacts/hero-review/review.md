# Revisión del vidrio — 2026-09-07

Referencia: `public/media/image.png`. Escena existente, ajustada para render
interactivo; el reflejo difuso es una aproximación, no una simulación de cáusticas.

- Espesor de 64 mm y bisel geométrico de 3 mm. El bisel transmite el fondo y
  absorbe el color del canto; no tiene emisión ni una cara opaca blanca.
- Eliminada la capa de barniz. Rugosidad de la cara acotada para que el mapa
  oscuro no la convierta accidentalmente en un espejo.
- El reflejo del suelo depende de la cámara y de la orientación actual de cada
  hoja. La sombra de contacto permanece en la base. Se conserva el poro del suelo.
- Iluminación del suelo compuesta antes del reflejo, sin el charco aditivo que
  blanqueaba las huellas azules.
- Pared con albedo, altura y rugosidad independientes, sin estirar el grano.
- Eliminadas ambas bandas estrechas de oclusión en la unión pared/suelo.
  Se añade una sombra ambiental baja en toda la pared: máscara independiente,
  opacidad máxima del 11 %, caída gaussiana vertical de 0,55 m. La máscara
  consulta una copia del campo de luz y reduce la sombra hasta anularla dentro
  del haz. Conserva la separación espacial sin un trazo oscuro en la unión.
- Luz de pared y suelo en capas independientes, con sus propios mapas y
  materiales; ningún archivo de textura compartido se ha modificado. La luz
  de pared comparte exactamente su geometría y posición, con sesgo de
  profundidad. La capa de suelo termina en la pared, manteniendo sus UV:
  evita franjas por profundidad y el oscurecimiento doble en la unión.

Verificación: build de producción correcto; dimensiones exteriores, cobertura
de grupos de material y UV de las tres hojas comprobadas con aserciones.
Capturas de cámara en progreso 0.15, 0.5 y 1 sin errores WebGL en el navegador.
La captura cercana conserva el desenfoque de arranque de la web.
`colour-samples.json` registra muestras RGB de 9×9 píxeles, como diagnóstico,
sin atribuirles una puntuación global de realismo.

La pared y las huellas se aproximan mejor en tono a la referencia. Sigue siendo
una recreación: el moteado del hormigón, la dispersión de luz, las proporciones
de la escena existente y el rótulo no son una reproducción fotográfica exacta.
El build avisa del tamaño del bloque de Three.js (508 kB antes de gzip).
