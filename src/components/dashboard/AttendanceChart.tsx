import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { frequenciaCultos } from "@/data/mockData";

export function AttendanceChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl bg-card p-6 shadow-card"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Frequência nos Cultos</h3>
        <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={frequenciaCultos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPresentes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(43, 96%, 56%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis 
              dataKey="mes" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 32%, 91%)',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: 'hsl(222, 47%, 11%)', fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="presentes"
              stroke="hsl(43, 96%, 56%)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPresentes)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
