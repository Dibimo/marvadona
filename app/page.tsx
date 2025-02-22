'use client'
import { FormEvent, useState } from "react";
const { differenceInMinutes } = require("date-fns");

export default function Home() {

  const [ entry, setEntry ] = useState("");
  const [ entryLunch, setEntryLunch ] = useState("");
  const [ endLunch, setEndLunch ] = useState("");
  const [ end, setEnd ] = useState("");

  const [ error, setError ] = useState(false)

  //"configurações de parâmetros"
  const workTimeDigos = 8

  //funções utilitarias porque a API de data do JavaScript é uma droga
  const addHours = (date: Date, hours: number) => date.setHours(date.getHours() + hours)
  const addMinutes = (date: Date, minutes: number) => date.setMinutes(date.getMinutes() + minutes)

  //função para converter uma string no formato "hh:mm" em date
  const convertDateStringsToDate = (...args: string[]) => args.map(a =>  {
    const [hours, minutes] = a.split(':')
    return new Date(2001, 1, 3, parseInt(hours), parseInt(minutes))
  })

  //função que calcula a diferença em horas e minutos entre duas duas (eu poderia ter usado as funções do date-fns ou outra lib).
  //apenas achei mais divertido fazer assim
  const getDifferenceInHoursAndMinutes = (dateA: Date, dateB: Date) => {
    let diff = dateA.getTime() - dateB.getTime()

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));

    return [hours, mins]
  }

  //função que formata um date em uma string no formato "hh:mm"
  const formartDateToHoursMinutes = (date: Date) => date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })

  //função que retorna a hora de saida esperada. nesse caso, a hora de entrada mais 8 horas
  const getExpectedExit = (date: Date) => new Date(addHours(date, workTimeDigos))

  //função que retorna a hora de saida real. nesse caso, a hora de saida esperada mais a quantidade de horas de almoço feitas
  const getRealExit = (exitExpected: Date, hours: number, minutes: number) => {
    const realExit = new Date(addHours(exitExpected, hours))
    return new Date(addMinutes(realExit, minutes))
  }

  const handleCalculateDigos = () => {
    if (!entry || !entryLunch || !endLunch) {
      setError(true)
      return
    }

    const [entryDate, entryLunchDate, endLunchDate] = convertDateStringsToDate(entry, entryLunch, endLunch)
    const exitExpected = getExpectedExit(entryDate)
    const [hours, mins] = getDifferenceInHoursAndMinutes(endLunchDate, entryLunchDate)

    const realExit = getRealExit(exitExpected, hours, mins)
    setEnd(formartDateToHoursMinutes(realExit))
  }


  async function handleCalculate(e: FormEvent){
      e.preventDefault();

      const workTime = 8

      if (!entry || !entryLunch || !endLunch) {
          setError(true)
          return
      }
      setError(false)

      let date_entry = new Date(`1970-01-01T${entry}:00Z`);
      let date_entryLunch = new Date(`1970-01-01T${entryLunch}:00Z`);

      let diff_hours_first_period = Math.floor(differenceInMinutes(date_entryLunch, date_entry) / 60)
      let diff_minute_first_period = differenceInMinutes(date_entryLunch, date_entry) % 60

      let rest_work_minutes = (60 - diff_minute_first_period == 60 ? 0 : 60 - diff_minute_first_period)
      let rest_work_hours = workTime - diff_hours_first_period - (rest_work_minutes == 0 ? 0 : 1)

      let get_hours_end_lunch = endLunch.split(":")[0]
      let get_minutes_end_lunch = endLunch.split(":")[1]

      let exit_minutes = (Number(get_minutes_end_lunch) + rest_work_minutes) >= 60 ? (Number(get_minutes_end_lunch) + rest_work_minutes) - 60 : (Number(get_minutes_end_lunch) + rest_work_minutes)
      let exit_hour = (Number(get_minutes_end_lunch) + rest_work_minutes) >= 60 ? (Number(get_hours_end_lunch) + rest_work_hours) + 1 : (Number(get_hours_end_lunch) + rest_work_hours)

      let format_exit_minutes = exit_minutes < 10 ? String().concat("0"+exit_minutes) : exit_minutes
      let format_exit_hour = exit_hour < 10 ? String().concat("0"+exit_hour) : exit_hour

      let exit_time = String().concat(format_exit_hour+":"+format_exit_minutes)

      setEnd(exit_time)

  }

  return (
    <div className="w-full h-[100vh] overflow-hidden flex flex-col items-center justify-center">
        <span className="text-3xl mb-5 text-slate-400">Olá, hoje é <span className="font-bold text-slate-100">{new Date().toLocaleDateString("pt-Br", { weekday: "long" })}</span>!</span>
        <div className="w-1/2 flex flex-col space-y-2 lg:w-1/4">
          <div className="">
            <span className="font-bold text-slate-200">Entrada</span>
            <input type="time" className="w-full text-lg bg-transparent rounded-md ring-1 ring-slate-200 px-5 py-2 outline-none" value={entry} onChange={(e) => setEntry(e.target.value)}/>
          </div>
          <div className="">
            <span className="font-bold text-slate-200">Saida pro armosso</span>
            <input type="time" className="w-full text-lg bg-transparent rounded-md ring-1 ring-slate-200 px-5 py-2 outline-none" value={entryLunch} onChange={(e) => setEntryLunch(e.target.value)}/>
          </div>
          <div className="">
            <span className="font-bold text-slate-200">Vorta do armosso</span>
            <input type="time" className="w-full text-lg bg-transparent rounded-md ring-1 ring-slate-200 px-5 py-2 outline-none" value={endLunch} onChange={(e) => setEndLunch(e.target.value)}/>
          </div>
          <div className="">
            <span className="font-bold text-slate-600">Saida</span>
            <input type="time" disabled={true} className="w-full text-lg bg-transparent rounded-md text-slate-600 ring-1 ring-slate-600 px-5 py-2 outline-none" value={end} onChange={(e) => setEnd(e.target.value)}/>
          </div>
        </div>
        <span className={`my-5 ${error ? 'text-red-300' : 'text-transparent select-none' }  font-bold`}>*Você deve prencher todos os campos necessários para calcular o período final</span>
        <button onClick={(e) => handleCalculateDigos()} className="w-1/2 bg-emerald-600 text-slate-200 font-bold px-5 py-2 rounded-md hover:bg-emerald-500 transition-all ease-in delay-75 lg:w-1/4">Calcular Horário de Saída</button>
    </div>
  );
}
