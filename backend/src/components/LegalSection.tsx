import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLanguage } from "@/context/LanguageContext";

const LegalSection = () => {
  const { language } = useLanguage();

  const documents = {
    ru: [
      {
        title: "Политика конфиденциальности",
        description: "Как Hunter собирает, хранит и использует данные посетителей сайта.",
        sections: [
          "Мы собираем только те персональные данные, которые пользователь добровольно оставляет при записи, обращении или отправке формы на сайте.",
          "Данные используются для обратной связи, подтверждения записи, улучшения сервиса и выполнения обязательств перед клиентом.",
          "Hunter не передаёт персональные данные третьим лицам, кроме случаев, когда это требуется законом или необходимо для оказания услуги.",
          "Пользователь вправе запросить изменение, уточнение или удаление своих персональных данных, обратившись по контактам, указанным на сайте.",
        ],
      },
      {
        title: "Условия использования",
        description: "Правила использования сайта, материалов и сервисов барбершопа.",
        sections: [
          "Используя сайт Hunter, пользователь подтверждает, что действует добросовестно и не нарушает применимое законодательство.",
          "Все материалы сайта, включая тексты, визуальные элементы и структуру, принадлежат Hunter либо используются на законных основаниях.",
          "Информация на сайте носит справочный характер и может обновляться без предварительного уведомления пользователя.",
          "Hunter оставляет за собой право изменять содержание сайта, перечень услуг и условия записи в любое время.",
        ],
      },
      {
        title: "Согласие на обработку персональных данных",
        description: "Подтверждение согласия клиента на обработку данных при использовании сайта.",
        sections: [
          "Оставляя свои данные на сайте, пользователь выражает согласие на их обработку в целях записи, консультации и сопровождения оказания услуги.",
          "Обработка данных включает сбор, систематизацию, хранение, уточнение, использование и удаление сведений в рамках действующего законодательства.",
          "Согласие действует до достижения целей обработки либо до момента его отзыва пользователем.",
          "Пользователь может отозвать согласие, направив соответствующий запрос через контакты, указанные на сайте.",
        ],
      },
    ],
    en: [
      {
        title: "Privacy Policy",
        description: "How Hunter collects, stores and uses visitor data.",
        sections: [
          "We collect only the personal data that a user voluntarily provides when booking, contacting us or submitting a form on the site.",
          "The data is used for follow-up communication, booking confirmation, service improvement and fulfillment of obligations to the client.",
          "Hunter does not share personal data with third parties except where required by law or necessary for providing the service.",
          "A user may request correction, clarification or deletion of personal data by contacting us through the details provided on the site.",
        ],
      },
      {
        title: "Terms of Use",
        description: "Rules for using the website, materials and barbershop services.",
        sections: [
          "By using the Hunter website, the user confirms that they act in good faith and do not violate applicable law.",
          "All website materials, including texts, visual elements and structure, belong to Hunter or are used on lawful grounds.",
          "Information on the website is provided for reference purposes and may be updated without prior notice.",
          "Hunter reserves the right to change website content, service offerings and booking conditions at any time.",
        ],
      },
      {
        title: "Consent to Personal Data Processing",
        description: "Confirmation of the client's consent to personal data processing while using the site.",
        sections: [
          "By submitting data on the site, the user consents to its processing for booking, consultation and support related to the service.",
          "Data processing includes collection, systematization, storage, clarification, use and deletion of information in accordance with applicable law.",
          "Consent remains valid until the processing purposes are fulfilled or until the user withdraws it.",
          "The user may withdraw consent by sending a relevant request using the contact details provided on the site.",
        ],
      },
    ],
  }[language];

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
      {documents.map((document) => (
        <Dialog key={document.title}>
          <DialogTrigger asChild>
            <button className="font-body text-xs tracking-wide text-muted-foreground underline-offset-4 transition-colors duration-300 hover:text-foreground hover:underline">
              {document.title}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl border-border bg-background text-foreground">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl font-light">{document.title}</DialogTitle>
              <DialogDescription className="font-body text-sm text-muted-foreground">
                {document.description}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
              {document.sections.map((section) => (
                <p key={section} className="font-body text-sm leading-relaxed text-muted-foreground">
                  {section}
                </p>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
};

export default LegalSection;
