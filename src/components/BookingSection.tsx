import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const masters = [
  { id: 1, name: "Артём Волков", role: "Старший мастер" },
  { id: 2, name: "Дмитрий Орлов", role: "Барбер-стилист" },
  { id: 3, name: "Максим Лисов", role: "Барбер" },
  { id: 4, name: "Иван Соколов", role: "Барбер" },
];

// Mock: generate availability data
const generateAvailability = () => {
  const today = new Date();
  const available: Date[] = [];
  const busy: Date[] = [];

  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === 0) {
      busy.push(new Date(d));
    } else if (Math.random() > 0.25) {
      available.push(new Date(d));
    } else {
      busy.push(new Date(d));
    }
  }
  return { available, busy };
};

const allTimeSlots = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

// Mock: generate time slot availability for a given date
const getTimeSlots = (date: Date | undefined) => {
  if (!date) return [];
  const seed = date.getDate() + date.getMonth();
  return allTimeSlots.map((time, i) => ({
    time,
    available: (seed + i) % 3 !== 0,
  }));
};

const BookingSection = () => {
  const [selectedMaster, setSelectedMaster] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { available, busy } = useMemo(() => generateAvailability(), []);
  const timeSlots = useMemo(() => getTimeSlots(selectedDate), [selectedDate]);

  const isAvailableDay = (date: Date) =>
    available.some((d) => d.toDateString() === date.toDateString());
  const isBusyDay = (date: Date) =>
    busy.some((d) => d.toDateString() === date.toDateString());

  return (
    <section id="booking" className="py-24 md:py-40 bg-card">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
            Запись
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-light text-foreground mb-16 md:mb-24">
            Выберите мастера
          </h2>
        </motion.div>

        {/* Masters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-24">
          {masters.map((master, i) => (
            <motion.button
              key={master.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => {
                setSelectedMaster(master.id);
                setSelectedDate(undefined);
                setSelectedTime(null);
              }}
              className={cn(
                "border text-left p-6 md:p-8 transition-all duration-300",
                selectedMaster === master.id
                  ? "border-foreground bg-foreground/5"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              {/* Monogram */}
              <div
                className={cn(
                  "w-12 h-12 flex items-center justify-center font-display text-xl mb-4 transition-colors duration-300",
                  selectedMaster === master.id
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {master.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <h3 className="font-display text-lg md:text-xl font-light text-foreground mb-1">
                {master.name}
              </h3>
              <p className="font-body text-xs text-muted-foreground tracking-wide">
                {master.role}
              </p>
            </motion.button>
          ))}
        </div>

        {/* Calendar + Time Grid */}
        {selectedMaster && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16"
          >
            {/* Calendar */}
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
                Выберите дату
              </p>
              <div className="border border-border p-4 inline-block">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
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
              {/* Legend */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-600/80" />
                  <span className="font-body text-xs text-muted-foreground">Свободно</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-600/80" />
                  <span className="font-body text-xs text-muted-foreground">Занято</span>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">
                Выберите время
              </p>
              {selectedDate ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      className={cn(
                        "py-3 px-4 border font-body text-sm transition-all duration-200",
                        slot.available && selectedTime === slot.time
                          ? "border-foreground bg-foreground text-background"
                          : slot.available
                          ? "border-green-600/50 text-foreground hover:border-foreground bg-green-600/10"
                          : "border-red-600/50 text-muted-foreground bg-red-600/10 cursor-not-allowed line-through"
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-body text-sm text-muted-foreground">
                  Сначала выберите дату в календаре
                </p>
              )}

              {/* Summary */}
              {selectedTime && selectedDate && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-10 border-t border-border pt-8"
                >
                  <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-4">
                    Ваш выбор
                  </p>
                  <p className="font-display text-xl md:text-2xl font-light text-foreground mb-1">
                    {masters.find((m) => m.id === selectedMaster)?.name}
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {selectedDate.toLocaleDateString("ru-RU", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    в {selectedTime}
                  </p>
                  <button className="mt-6 font-body text-xs tracking-[0.15em] uppercase bg-foreground text-background px-8 py-4 hover:bg-muted-foreground transition-colors duration-300">
                    Подтвердить запись
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default BookingSection;
