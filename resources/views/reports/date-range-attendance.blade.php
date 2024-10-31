<!-- resources/views/reports/date-range-attendance.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <title>Attendance Report ({{ $fromDate }} to {{ $toDate }})</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.2/axios.min.js"></script>

    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            padding-bottom: 40px;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
        }
        th, td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        th { 
            background-color: #f8f9fa; 
        }
        h1 { 
            color: #333; 
        }
        .report-header { 
            margin-bottom: 30px; 
        }
        .report-info { 
            color: #666; 
        }
        .action-buttons {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 15px;
            background: white;
            border-top: 1px solid #ddd;
            text-align: right;
        }
        .download-btn {
            background-color: #166534;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        .download-btn:hover {
            background-color: #14532d;
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>Attendance Report</h1>
        <div class="report-info">
            <p>Period: {{ $fromDate }} to {{ $toDate }}</p>
            <p>Generated on: {{ date('F d, Y H:i:s') }}</p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Days Worked</th>
                <th>Average Time In</th>
                <th>Average Time Out</th>
                <th>Average Hours/Day</th>
                <th>Total Hours</th>
                <th>Total Lates</th>
            </tr>
        </thead>
        <tbody>
            @foreach($records as $record)
            <tr>
                <td>{{ $record['user_id'] }}</td>
                <td>{{ $record['name'] }}</td>
                <td>{{ $record['days_worked'] }}</td>
                <td>{{ $record['avg_time_in'] }}</td>
                <td>{{ $record['avg_time_out'] }}</td>
                <td>{{ $record['avg_hours_per_day'] }}</td>
                <td>{{ $record['total_hours'] }}</td>
                <td>{{ $record['total_lates'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

   <div class="action-buttons">
    <button onclick="downloadExcel()" class="download-btn">
        Download Excel
    </button>
</div>

 <script>
        // Configure axios instance
        const axiosClient = axios.create({
            baseURL: '{{ config('app.url') }}/api',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true
        });

        // Add CSRF token if you're using Laravel's CSRF protection
        const token = document.head.querySelector('meta[name="csrf-token"]');
        if (token) {
            axiosClient.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
        }

        async function downloadExcel() {
            try {
                const fromDate = '{{ $fromDate }}';
                const toDate = '{{ $toDate }}';
                
                const response = await axiosClient.get('/download-date-range-report', {
                    params: {
                        from_date: fromDate,
                        to_date: toDate
                    },
                    responseType: 'blob'
                });

                const blob = new Blob([response.data], { 
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
                
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance_report_${fromDate}_to_${toDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
            } catch (error) {
                console.error('Error downloading file:', error);
                alert('Error downloading report. Please try again.');
            }
        }
    </script>
</body>
</html>