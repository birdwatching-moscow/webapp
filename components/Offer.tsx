import styles from './Offer.module.css'

export const Offer = () => (
  <main className={styles.page}>
    <div className={styles.content}>

      {/* Mobile: company tagline as the visual heading */}
      <header className={styles.mobileHeader}>
        <h1 className={`text-display ${styles.heading}`}>
          Политика в отношении обработки персональных данных
        </h1>
        <p className={`text-body-l ${styles.subtitle}`}>
          Условия использования сайта и оформления участия в прогулках, лекциях и экспедициях.
        </p>
      </header>

      {/* Desktop: full legal document title */}
      <header className={styles.desktopHeader}>
        <h1 className={`text-display ${styles.heading}`}>
          Политика в отношении обработки персональных данных
        </h1>
        <p className={`text-body-l ${styles.subtitle}`}>
          Условия использования сайта и оформления участия в прогулках, лекциях и экспедициях.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={`text-h2 ${styles.sectionTitle}`}>Простыми словами</h2>
        <p className={`text-body ${styles.paragraph}`}>
          Мы собираем ваше имя, e-mail и базовые метрики использования Личного кабинета, чтобы сервис работал стабильно, мы могли отправлять вам важные уведомления и улучшать продукт. Данные хранятся на защищённых серверах в РФ, мы не передаём их третьим лицам и не делаем маркетинговых рассылок. Вы всегда можете запросить доступ к своим данным, их изменение или полное удаление, обратившись в нашу службу поддержки.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={`text-h2 ${styles.sectionTitle}`}>1. Общие положения</h2>
        <p className={`text-body ${styles.paragraph}`}>
          Настоящая Политика обработки персональных данных составлена в соответствии с Федеральным
          законом от 27.07.2006 №&nbsp;152-ФЗ «О персональных данных» (далее — 152-ФЗ) и определяет
          порядок обработки персональных данных и меры по обеспечению безопасности, предпринимаемые
          ООО «Название компании» (далее — Оператор).
        </p>
        <ul className={styles.list}>
          <li className={`text-body ${styles.listItem}`}>ИНН: &lt;ИНН&gt;</li>
          <li className={`text-body ${styles.listItem}`}>ОГРН: &lt;ОГРН&gt;</li>
          <li className={`text-body ${styles.listItem}`}>Юридический адрес: &lt;Адрес&gt;</li>
          <li className={`text-body ${styles.listItem}`}>Электронная почта для обращений: <a href="mailto:birdwatching@mail.ru" className="text-link">birdwatching@mail.ru</a></li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={`text-h2 ${styles.sectionTitle}`}>2. Правовые основания обработки</h2>
        <p className={`text-body ${styles.paragraph}`}>
          Оператор обрабатывает персональные данные субъекта только в случаях их заполнения и/или
          отправки самостоятельно в специальной форме Личного кабинета. Выражая согласие,
          пользователь принимает условия настоящей Политики (ст.&nbsp;9 152-ФЗ) и даёт согласие на
          обработку данных для исполнения договора (п.&nbsp;5 ч.&nbsp;1 ст.&nbsp;6 152-ФЗ).
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={`text-h2 ${styles.sectionTitle}`}>3. Категории обрабатываемых данных</h2>
        <p className={`text-body ${styles.paragraph}`}>
          В рамках работы Личного кабинета Оператор обрабатывает следующие данные:
        </p>
        <ul className={styles.list}>
          <li className={`text-body ${styles.listItem}`}>имя или имя пользователя (никнейм);</li>
          <li className={`text-body ${styles.listItem}`}>адрес электронной почты (e-mail);</li>
          <li className={`text-body ${styles.listItem}`}>аналитические метрики использования сервиса (данные о сессиях, события интерфейса, технические логи).</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={`text-h2 ${styles.sectionTitle}`}>4. Цели обработки персональных данных</h2>
        <ul className={styles.list}>
          <li className={`text-body ${styles.listItem}`}>Регистрация и идентификация пользователя в Личном кабинете;</li>
          <li className={`text-body ${styles.listItem}`}>предоставление доступа к функционалу сервиса и оказание услуг;</li>
          <li className={`text-body ${styles.listItem}`}>направление сервисных уведомлений и ответы на запросы пользователя;</li>
          <li className={`text-body ${styles.listItem}`}>проведение аналитических исследований для улучшения качества работы платформы.</li>
        </ul>
      </section>

      <p className={`text-body ${styles.version}`}>
        Версия документа: 21 августа 2026
      </p>

    </div>
  </main>
)
