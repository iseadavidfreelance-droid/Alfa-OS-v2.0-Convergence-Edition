import React, from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database.types';
import { DollarSign } from 'lucide-react';

type Transaction = Database['public']['Tables']['transaction_ledger']['Row'];

interface FinancialLogProps {
    assetId: string;
}

const LogRowSkeleton = () => (
    <tr className="border-b border-gray-800 animate-pulse">
        <td className="p-2"><div className="h-4 bg-gray-700 rounded w-32"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-700 rounded w-24"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-700 rounded w-40"></div></td>
        <td className="p-2"><div className="h-4 bg-gray-700 rounded w-16"></div></td>
    </tr>
);

const FinancialLog: React.FC<FinancialLogProps> = ({ assetId }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchLedger = async () => {
            if (!assetId) return;
            setLoading(true);
            setError(null);
            
            const { data, error } = await supabase
                .from('transaction_ledger')
                .select('*')
                .eq('asset_id', assetId)
                .order('recorded_at', { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setTransactions(data);
            }
            setLoading(false);
        };

        fetchLedger();
    }, [assetId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month} ${hours}:${minutes}`;
    };

    return (
        <div>
            <h3 className="text-sm text-gray-500 font-bold tracking-wider uppercase flex items-center gap-2 mb-1">
                <DollarSign size={14} /> Financial Ledger
            </h3>
            <div className="bg-gray-800/50 border border-gray-700 rounded-sm p-2 h-64 overflow-y-auto">
                <table className="w-full text-xs font-mono">
                    <thead>
                        <tr className="text-left text-gray-400 border-b border-gray-600">
                            <th className="p-2 font-semibold">FECHA</th>
                            <th className="p-2 font-semibold">OPERADOR</th>
                            <th className="p-2 font-semibold">CONTEXTO</th>
                            <th className="p-2 font-semibold text-right">MONTO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <LogRowSkeleton key={i} />)
                        ) : error ? (
                             <tr><td colSpan={4} className="p-4 text-center text-alert">{error}</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No transactions recorded.</td></tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-2 text-gray-400">{formatDate(tx.recorded_at)}</td>
                                    <td className="p-2 text-gray-300 truncate" title={tx.operator_id}>{tx.operator_id.substring(0, 8)}...</td>
                                    <td className="p-2 text-gray-300">{tx.context}</td>
                                    <td className={`p-2 text-right font-bold ${tx.amount >= 0 ? 'text-matrix' : 'text-alert'}`}>
                                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinancialLog;
