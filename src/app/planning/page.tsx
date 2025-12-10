import { Calendar } from 'lucide-react'

export default function PlanningPage() {
  return (
    <div className="flex flex-col h-screen p-6 max-w-[1600px] mx-auto">
      
      {/* En-tête simple */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Mon Planning Google</h1>
      </div>

      {/* Le conteneur de l'agenda */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1">
        
        {/* REMPLACEZ LE SRC CI-DESSOUS PAR L'URL QUE VOUS AVEZ TROUVÉE DANS GOOGLE AGENDA */}
        {/* Gardez bien le style="border: 0" etc. */}
        <iframe 
          src="https://calendar.google.com/calendar/embed?src=y.rainaud@tastyvideo.fr%40gmail.com&ctz=Europe%2FParis" 
          style={{ border: 0 }} 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no"
        ></iframe>
        
      </div>
    </div>
  )
}import { Calendar } from 'lucide-react'

export default function PlanningPage() {
  return (
    <div className="flex flex-col h-screen p-6 max-w-[1600px] mx-auto">
      
      {/* En-tête simple */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Calendar className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Mon Planning Google</h1>
      </div>

      {/* Le conteneur de l'agenda */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-1">
        
        {/* REMPLACEZ LE SRC CI-DESSOUS PAR L'URL QUE VOUS AVEZ TROUVÉE DANS GOOGLE AGENDA */}
        {/* Gardez bien le style="border: 0" etc. */}
        <iframe 
          src="https://calendar.google.com/calendar/embed?src=VOTRE_ADRESSE_EMAIL%40gmail.com&ctz=Europe%2FParis" 
          style={{ border: 0 }} 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          scrolling="no"
        ></iframe>
        
      </div>
    </div>
  )
}
