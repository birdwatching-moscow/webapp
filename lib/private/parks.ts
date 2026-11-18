import type { PhotoCredit } from '@/types/photoCredit'

export type PrivatePark = {
  name: string
  description: string
  /** Без префикса «Птицы:» — его добавляет LocationCard */
  species: string
  /** Нет фото — карточка покажет плейсхолдер */
  imageUrl?: string
  /** Автор и лицензия фото — по клику на значок «i»; нет (общественное достояние) — значка нет */
  photoCredit?: PhotoCredit
}

const img = (file: string) => `/images/parks/${file}.jpg`

const LICENSE_URLS = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY 3.0': 'https://creativecommons.org/licenses/by/3.0/',
  'CC BY 4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const

/** Фото с Wikimedia Commons: автор ведёт на страницу файла, лицензия — на её текст. */
const commons = (author: string, sourceUrl: string, license: keyof typeof LICENSE_URLS): PhotoCredit => ({
  author,
  sourceUrl,
  license,
  licenseUrl: LICENSE_URLS[license],
})

/** Локации для персональных прогулок — порядок как в макете (Figma 1697:2395). */
export const PRIVATE_PARKS: readonly PrivatePark[] = [
  {
    name: 'Скверы МГУ',
    description: 'Прогулка по скверам у Московского государственного университета; зимой удобно наблюдать птиц у кормушек.',
    species: 'зеленушка, пухляк, снегирь, ворон, черный стриж, озёрная чайка…',
    imageUrl: img('mgu'),
    photoCredit: commons('Ivtorov', 'https://commons.wikimedia.org/wiki/File:2016-MSU.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Измайловский парк',
    description: 'Старинные пруды, сосновый бор, березовые рощи с полянками, архитектурные памятники XVIII века.',
    species: 'красноголовый нырок, чирок-свистунок, лесная завирушка, тростниковая и обыкновенная овсянка, вальдшнеп, черныш…',
    imageUrl: img('izmailovo'),
    photoCredit: commons('Kristy2906', 'https://commons.wikimedia.org/wiki/File:Вид_на_Большое_колесо_обозрения_и_Круглый_пруд,_Измайловский_ПКиО.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Главный Ботанический сад',
    description: 'Лесной массив, по территории протекает река Каменка с каскадом прудов, ландшафтный ансамбль дополняет сад непрерывного цветения, вересковый и японский сад.',
    species: 'ястреб-перепелятник, ворон, московка, большая синица, лазоревка, поползень…',
    imageUrl: img('gbs'),
    photoCredit: commons('Andrey Korzun', 'https://commons.wikimedia.org/wiki/File:2019_Botanical_garden_Moscow_laboratory_01.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Парк Царицыно',
    description: 'Лесопарк, Верхний и Нижний пруды, дворцовый ансамбль.',
    species: 'в мае — брачное поведение чомг, серебристая чайка, речная крачка, хохотунья, галка, снегирь…',
    imageUrl: img('tsaritsino'),
    photoCredit: commons('Юрий Артамонов', 'https://commons.wikimedia.org/wiki/File:Tsaritsyno_Park_(2007-10-02).jpg', 'CC BY 4.0'),
  },
  {
    name: 'Верхнеяузские болота (Лосиный остров)',
    description: 'Разливы реки Яуза обладают большим разнообразием биотопов: открытые водные пространства, заболоченные участки, протоки, сухие гривки, заросшие березняком, участки заливных лугов.',
    species: 'колония озёрных чаек (апрель–июнь), лысуха, красноголовый нырок, широконоска, серая утка, хохлатая чернеть…',
    imageUrl: img('verkhneyauzskie_bolota'),
    photoCredit: commons('Nikiforovvb', 'https://commons.wikimedia.org/wiki/File:Losiny_Ostrov_2009-09-22.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Серебряный бор',
    description: 'Искусственный остров, расположенный в излучине Москвы-реки и отделенный от нее рукотворным каналом. Лесной массив, озера, пляжи.',
    species: 'пищуха, зеленушка, пухляк, ополовник, поползень, белоспинный дятел…',
    imageUrl: img('serbor'),
    photoCredit: commons('Семашко Сергей Игоревич', 'https://commons.wikimedia.org/wiki/File:N2K_9440.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Парк Покровское-Стрешнево',
    description: 'Лесопарк, река Химка, бобры, ондатры; каскад из семи проточных прудов в русле реки Чернушки.',
    species: 'серебристая и озёрная чайки, клуша, большой пестрый и седой дятлы, большая синица, лазоревка, пищуха…',
    imageUrl: img('streshnevo'),
    photoCredit: commons('Sunny365days', 'https://commons.wikimedia.org/wiki/File:Pokrovskoye-Streshnevo_(estate)_IMG_1015_01.jpg', 'CC BY 4.0'),
  },
  {
    name: 'Парк Кузьминки',
    description: 'Уникальный лесной массив с разнообразными биотопами: пруды, ручьи, лес.',
    species: 'камышница, пастушок, перевозчик, фифи, черныш, коростель…',
    imageUrl: img('kuzminki'),
    photoCredit: commons('Oleg Yu.Novikov', "https://commons.wikimedia.org/wiki/File:Kuz'minky._Moscow,_Russia._-_panoramio_-_Oleg_Yu.Novikov_(55).jpg", 'CC BY 3.0'),
  },
  {
    name: 'Коломенское',
    description: 'Зимняя локация; маршрут вдоль набережной Москвы-реки — будем высматривать водоплавающих птиц.',
    species: 'чайки озёрная, сизая, серебристая, бургомистр, хохотунья, пищуха…',
    imageUrl: img('kolomenskoe'),
    photoCredit: commons('Alexander Baranov', 'https://commons.wikimedia.org/wiki/File:Kolomenskoe_*_*_*_(3355751399).jpg', 'CC BY 2.0'),
  },
  {
    name: 'Виноградовская пойма',
    description: 'Виноградовская пойма, а вернее «Москворецкий пойменный заказник», является одним из значимых мест в жизни птиц. Каждый год там останавливаются для отдыха или гнездования множество видов. Важно: в апреле–июне обязательно нужны высокие болотные сапоги длиной выше колена.',
    species: 'серая цапля, серый журавль, лебедь-кликун, гуменник, белолобый гусь, травник…',
    imageUrl: img('vinogradovo'),
    photoCredit: commons('Powakkattsi', 'https://commons.wikimedia.org/wiki/File:Виноградовская_пойма_летом.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Лотошинский рыбхоз',
    description: 'Территория рыбхоза представлена разнообразными биотопами и привлекает множество видов птиц, а богатая кормовая база способствует их высокой концентрации. Во время осенней миграции это излюбленное место отдыха перелетных птиц.',
    species: 'белая лазоревка, славки, коноплянка, овсянка, свиязь, лебедь…',
    imageUrl: img('lotoshino'),
    photoCredit: commons('Дмитрий Мозжухин', 'https://commons.wikimedia.org/wiki/File:Аисты_-_panoramio_(1).jpg', 'CC BY 3.0'),
  },
  {
    name: 'Битцевский лес',
    description: 'Здесь сохранилось большое разнообразие природных ландшафтов, каждый из которых населяет свой собственный видовой набор птиц: от самого большого суходольного луга Москвы на Лысой горе до лесных буреломов вдоль речных оврагов.',
    species: 'ворон, грач, сойка, большой, белоспинный и малый пестрый дятел, черноголовый щегол…',
    imageUrl: img('bitcevskiy_les'),
  },
  {
    name: 'Нескучный сад',
    description: 'Лесная зона вдоль Москвы-реки.',
    species: 'большая синица, лазоревка, поползень, пищуха, пухляк, соловей…',
    imageUrl: img('neskuchniy'),
    photoCredit: commons('Valeri Pizhanski', 'https://commons.wikimedia.org/wiki/File:Vorobyovy_Gory_(30185212680).jpg', 'CC BY-SA 2.0'),
  },
  {
    name: 'Щукинский полуостров',
    description: 'Прогулка по берегу Строгинского затона и по территории полуострова. Разные биотопы, практически не тронутые благоустройством.',
    species: 'серая цапля, дятлы, пищуха, крапивник, ополовник, славка…',
    imageUrl: img('shcukinskiy'),
    photoCredit: commons('MBH', 'https://commons.wikimedia.org/wiki/File:Stroginskaya_poyma_21.jpg', 'CC BY 4.0'),
  },
  {
    name: 'Яхромская пойма',
    description: 'Пруды, разделённые дамбами, поле. Короткий, комфортный, насыщенный птицами маршрут.',
    species: 'мородунка, турухтан, поручейник, щеголь, фифи, чернозобик…',
    imageUrl: img('yakhroma'),
    photoCredit: commons('Mike like0708', 'https://commons.wikimedia.org/wiki/File:Канал_им._Москвы_Яхрома.jpg', 'CC BY-SA 4.0'),
  },
  {
    name: 'Лианозовский питомник',
    description: 'Небольшой лесопарк вдоль поймы ручья Безымянного, с запрудами и участками лиственных и хвойных деревьев.',
    species: 'большая синица, лазоревка, желтоголовый королек, большой пёстрый дятел, ворон, мухоловка-пеструшка, зеленая пересмешка, черный и певчий дрозд, дубонос, чиж, рябинник, ополовник, канюк…',
    imageUrl: img('lianozovo'),
    photoCredit: commons('Gennady Grachev', 'https://commons.wikimedia.org/wiki/File:Moscow,_Lianozovo_Forest_Park_-_ponds_(31494199342).jpg', 'CC BY 2.0'),
  },
  {
    name: 'Константиново (Сергиево-Посадского района)',
    description: 'Поле, луг, лес. Большие скопления птиц на весеннем пролёте. Весной нужны резиновые сапоги до колена.',
    species: 'белолобый гусь, серый журавль, серая куропатка, лебедь-кликун, коростель, полевой жаворонок, овсянки, чибис, большой кроншнеп, турухтан, чернозобик…',
    imageUrl: img('konstantinovo'),
  },
  {
    name: 'Хотьково (велобёрдинг)',
    description: 'Вело-бёрдинг по маршруту Радонеж – Хотьково: пойма реки, поле, лес, пруд.',
    species: 'кукушка, коростель, чибис, малый зуек, чеглок, пустельга, болотный лунь, канюк, иволга, соловей, желна…',
    imageUrl: img('khotkovo'),
  },
]
