import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: string | number | null;
  duration_min: number;
  is_active: boolean;
};

type AvailabilityRangeResponse = {
  success: boolean;
  data: {
    days: Array<{
      date: string;
      available: boolean;
    }>;
  };
};

type DayAvailabilityResponse = {
  success: boolean;
  data: {
    service: Service | null;
    slots: Array<{
      time: string;
      available: boolean;
    }>;
  };
};

const formatDateOnly = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatPrice = (value: string | number | null, language: "ru" | "en") => {
  if (value === null || value === undefined) {
    return language === "ru" ? "По запросу" : "On request";
  }

  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return new Intl.NumberFormat(language === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(numeric);
};

const fetchJson = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Request failed");
  }

  return result as T;
};

type BookingPanelProps = {
  initialServiceId?: string | null;
};

export const BookingPanel = ({ initialServiceId }: BookingPanelProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const rangeEnd = useMemo(() => {
    const date = new Date(today);
    date.setDate(date.getDate() + 30);
    return date;
  }, [today]);

  const copy = {
    ru: {
      chooseDate: "Выберите дату",
      chooseTime: "Выберите время",
      chooseService: "Выберите услугу",
      free: "Свободно",
      busy: "Занято",
      firstChooseDate: "Сначала выберите дату в календаре",
      yourChoice: "Ваш выбор",
      confirmHint: "Выберите услугу, дату и время, затем оставьте контакты",
      confirm: "Подтвердить запись",
      loading: "Загружаем услуги...",
      noServices: "Активных услуг пока нет",
      name: "Имя",
      surname: "Фамилия",
      phone: "Телефон",
      notes: "Комментарий",
      service: "Услуга",
      requestSent: "Запись создана",
      requestSentText: "Заявка уже улетела в CRM. Теперь её видно в админке.",
      requestFailed: "Не удалось отправить запись",
      unavailableDay: "На эту дату свободных слотов нет",
      noSlots: "Для выбранной даты свободных слотов нет",
      chooseServiceFirst: "Сначала выберите услугу",
    },
    en: {
      chooseDate: "Choose a date",
      chooseTime: "Choose a time",
      chooseService: "Choose a service",
      free: "Available",
      busy: "Busy",
      firstChooseDate: "Select a date in the calendar first",
      yourChoice: "Your choice",
      confirmHint: "Choose service, date and time, then leave your contact details",
      confirm: "Confirm booking",
      loading: "Loading services...",
      noServices: "No active services yet",
      name: "First name",
      surname: "Last name",
      phone: "Phone",
      notes: "Notes",
      service: "Service",
      requestSent: "Booking created",
      requestSentText: "The request has already been sent to the CRM and is visible in admin.",
      requestFailed: "Failed to submit booking",
      unavailableDay: "No available slots for this date",
      noSlots: "No slots available for this date",
      chooseServiceFirst: "Choose a service first",
    },
  }[language];

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await fetchJson<{ success: boolean; data: Service[] }>("/api/services");
      return result.data.filter((service) => service.is_active);
    },
  });

  const selectedService = servicesQuery.data?.find((service) => service.id === selectedServiceId) ?? null;

  useEffect(() => {
    if (initialServiceId && servicesQuery.data?.some((service) => service.id === initialServiceId)) {
      setSelectedServiceId(initialServiceId);
      return;
    }

    if (!selectedServiceId && servicesQuery.data?.length) {
      setSelectedServiceId(servicesQuery.data[0].id);
    }
  }, [initialServiceId, selectedServiceId, servicesQuery.data]);

  const availabilityRangeQuery = useQuery({
    queryKey: ["availability-range", selectedServiceId, formatDateOnly(today), formatDateOnly(rangeEnd)],
    enabled: Boolean(selectedServiceId),
    queryFn: async () => {
      const params = new URLSearchParams({
        serviceId: selectedServiceId,
        dateFrom: formatDateOnly(today),
        dateTo: formatDateOnly(rangeEnd),
      });

      const result = await fetchJson<AvailabilityRangeResponse>(`/api/public/availability?${params.toString()}`);
      return result.data.days;
    },
  });

  const selectedDateKey = selectedDate ? formatDateOnly(selectedDate) : "";
  const dayAvailabilityQuery = useQuery({
    queryKey: ["availability-day", selectedServiceId, selectedDateKey],
    enabled: Boolean(selectedServiceId && selectedDateKey),
    queryFn: async () => {
      const params = new URLSearchParams({
        serviceId: selectedServiceId,
        date: selectedDateKey,
      });

      const result = await fetchJson<DayAvailabilityResponse>(`/api/public/availability?${params.toString()}`);
      return result.data.slots;
    },
  });

  const availableDates = useMemo(
    () => availabilityRangeQuery.data?.filter((item) => item.available).map((item) => item.date) ?? [],
    [availabilityRangeQuery.data],
  );

  const busyDates = useMemo(
    () => availabilityRangeQuery.data?.filter((item) => !item.available).map((item) => item.date) ?? [],
    [availabilityRangeQuery.data],
  );

  const timeSlots = selectedDate ? dayAvailabilityQuery.data ?? [] : [];
  const isAvailableDay = (date: Date) => availableDates.includes(formatDateOnly(date));
  const isBusyDay = (date: Date) => busyDates.includes(formatDateOnly(date));

  const summaryDate = selectedDate;
  const summaryTime = selectedTime;

  const canSubmit = Boolean(
    selectedServiceId && selectedDate && selectedTime && firstName.trim() && phone.trim(),
  );

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedServiceId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${formatDateOnly(selectedDate)}T${selectedTime}:00`);
      const response = await fetch("/api/public/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim() || null,
          phone: phone.trim(),
          serviceId: selectedServiceId,
          scheduledAt: scheduledAt.toISOString(),
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error ?? copy.requestFailed);
      }

      toast({
        title: copy.requestSent,
        description: copy.requestSentText,
      });

      setSelectedTime(null);
      setSelectedDate(undefined);
      setFirstName("");
      setLastName("");
      setPhone("");
      setNotes("");
      await availabilityRangeQuery.refetch();
    } catch (error) {
      toast({
        title: copy.requestFailed,
        description: error instanceof Error ? error.message : copy.requestFailed,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border border-border bg-card p-6 md:p-10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground">
              {copy.chooseDate}
            </p>
          </div>

          <div className="mb-6">
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-3">
              {copy.chooseService}
            </p>

            <Select value={selectedServiceId} onValueChange={setSelectedServiceId} disabled={servicesQuery.isLoading}>
              <SelectTrigger className="h-12 border-border bg-background px-4 font-body text-sm text-foreground">
                <SelectValue
                  placeholder={
                    servicesQuery.isLoading ? copy.loading : servicesQuery.isError ? copy.noServices : copy.chooseService
                  }
                />
              </SelectTrigger>
              <SelectContent className="border-border bg-background text-foreground">
                {servicesQuery.data?.map((service) => (
                  <SelectItem
                    key={service.id}
                    value={service.id}
                    className="font-body text-sm text-foreground focus:bg-card focus:text-foreground"
                  >
                    {service.name} · {formatPrice(service.price, language)} · {service.duration_min} {language === "ru" ? "мин" : "min"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-border p-4 inline-block">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime(null);
              }}
              disabled={(date) => {
                const isPast = date < today;

                if (isPast || !selectedServiceId) {
                  return true;
                }

                return !isAvailableDay(date);
              }}
              className="p-3 pointer-events-auto"
              modifiers={{
                available: (date) => isAvailableDay(date),
                busy: (date) => isBusyDay(date),
              }}
              modifiersClassNames={{
                available: "booking-day-available",
                busy: "booking-day-busy",
              }}
            />
          </div>

          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600/80" />
              <span className="font-body text-xs text-muted-foreground">{copy.free}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600/80" />
              <span className="font-body text-xs text-muted-foreground">{copy.busy}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
            {copy.chooseTime}
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!selectedDate || !slot.available}
                onClick={() => slot.available && setSelectedTime(slot.time)}
                className={cn(
                  "py-3 px-4 border font-body text-sm transition-all duration-200",
                  !selectedDate
                    ? "border-border text-muted-foreground bg-background/60 cursor-not-allowed opacity-70"
                    : slot.available
                      ? selectedTime === slot.time
                        ? "border-green-600/80 bg-green-600/25 text-foreground"
                        : "border-green-600/50 text-foreground hover:border-green-600/70 bg-green-600/10"
                      : "border-red-600/60 text-red-300 bg-red-600/20 cursor-not-allowed opacity-70"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {!selectedServiceId && (
            <p className="font-body text-sm text-muted-foreground mt-4">{copy.chooseServiceFirst}</p>
          )}

          {selectedServiceId && !selectedDate && (
            <p className="font-body text-sm text-muted-foreground mt-4">{copy.firstChooseDate}</p>
          )}

          {selectedDate && !timeSlots.length && (
            <p className="font-body text-sm text-muted-foreground mt-4">{copy.noSlots}</p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 border-t border-border pt-8"
          >
            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
              {copy.yourChoice}
            </p>

            <div className="space-y-4">
              <div>
                <p className="font-display text-xl md:text-2xl font-light text-foreground mb-1">
                  {summaryDate
                    ? summaryDate.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })
                    : copy.confirmHint}
                </p>
                {selectedService ? (
                  <p className="font-body text-sm text-muted-foreground">
                    {copy.service}: {selectedService.name}
                    {summaryTime ? (language === "ru" ? `, в ${summaryTime}` : `, at ${summaryTime}`) : ""}
                  </p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={copy.name}
                  className="h-12 border-border bg-background font-body text-sm"
                />
                <Input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  placeholder={copy.surname}
                  className="h-12 border-border bg-background font-body text-sm"
                />
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={copy.phone}
                  className="h-12 border-border bg-background font-body text-sm sm:col-span-2"
                />
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={copy.notes}
                  className="min-h-[120px] border-border bg-background font-body text-sm sm:col-span-2"
                />
              </div>

              <button
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className={cn(
                  "mt-2 font-body text-xs tracking-[0.15em] uppercase px-8 py-4 transition-colors duration-300",
                  canSubmit && !isSubmitting
                    ? "bg-foreground text-background hover:bg-accent"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isSubmitting ? (language === "ru" ? "Отправляем..." : "Submitting...") : copy.confirm}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const BookingSection = () => {
  const { language } = useLanguage();
  const copy = {
    ru: {
      eyebrow: "Запись",
      title: "Выберите дату и время",
    },
    en: {
      eyebrow: "Booking",
      title: "Choose your date and time",
    },
  }[language];

  return (
    <section id="booking" className="section-golden bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            {copy.eyebrow}
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-foreground golden-stack">
            {copy.title}
          </h2>
        </motion.div>

        <BookingPanel />
      </div>
    </section>
  );
};

export default BookingSection;
