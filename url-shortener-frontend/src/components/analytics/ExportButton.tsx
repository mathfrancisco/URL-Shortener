// src/components/analytics/ExportButton.tsx

import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import {useState} from 'react';
import axios from 'axios';

interface ExportButtonProps {
    urlId: string,
    isAlias?: boolean | undefined
}

export function ExportButton({urlId, isAlias}: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/analytics/${urlId}/export`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analytics-${urlId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Erro ao exportar dados.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button onClick={handleExport} disabled={loading} variant="outline">
            <Download className="h-4 w-4 mr-2"/>
            {loading ? 'Exportando...' : 'Exportar CSV'}
        </Button>
    );
}