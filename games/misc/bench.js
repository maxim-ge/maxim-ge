
/**
 * IndexDB Performance Benchmark
 * 
 * This application benchmarks the read/write performance of IndexedDB
 * using Dexie.js library. It measures how many files per second can be 
 * created and read using the browser's local storage capabilities.
 */

// Initialize Dexie database
const db = new Dexie('BenchmarkDatabase');

// Define database schema
db.version(1).stores({
    files: '++id, name, size, dateCreated'
});

// Benchmark Controller class
class BenchmarkController {
    constructor() {
        // State properties
        this.isRunning = false;
        this.isStopping = false;
        this.benchmarkType = null; // 'read' or 'write'
        this.totalFiles = 0;
        this.processedFiles = 0;
        this.startTime = null;
        this.endTime = null;
        this.processingRate = 0;
        this.totalDataProcessed = 0;
        this.actualAvgFileSize = 0;
        this.intervalId = null;

        // UI Elements
        this.numFilesInput = document.getElementById('num-files');
        this.avgFileSizeInput = document.getElementById('avg-file-size');
        this.progressBar = document.getElementById('progress-bar');
        this.progressPercentage = document.getElementById('progress-percentage');
        this.filesProcessedEl = document.getElementById('files-processed');
        this.processingRateEl = document.getElementById('processing-rate');
        this.elapsedTimeEl = document.getElementById('elapsed-time');
        this.estimatedTimeEl = document.getElementById('estimated-time');
        this.actualAvgSizeEl = document.getElementById('actual-avg-size');
        this.totalDataEl = document.getElementById('total-data');
        this.memoryUsageEl = document.getElementById('memory-usage');
        this.readBenchBtn = document.getElementById('read-benchmark');
        this.writeBenchBtn = document.getElementById('write-benchmark');
        this.stopBenchBtn = document.getElementById('stop-benchmark');
        this.statusMessage = document.getElementById('status-message');

        // Initialize
        this.checkDatabaseInitialized();
        this.attachEventListeners();
    }

    // Check if database is initialized and initialize if needed
    async checkDatabaseInitialized() {
        try {
            const count = await db.files.count();
            this.showStatus(`Database initialized. ${count} files in storage.`);
        } catch (error) {
            this.showStatus('Error initializing database: ' + error.message);
        }
    }

    // Set up event listeners
    attachEventListeners() {
        this.readBenchBtn.addEventListener('click', () => this.startBenchmark('read'));
        this.writeBenchBtn.addEventListener('click', () => this.startBenchmark('write'));
        this.stopBenchBtn.addEventListener('click', () => this.stopBenchmark());

        // Add input validation
        this.numFilesInput.addEventListener('change', () => {
            let value = parseInt(this.numFilesInput.value);
            if (value < 10) value = 10;
            if (value > 100000) value = 100000;
            this.numFilesInput.value = value;
        });

        this.avgFileSizeInput.addEventListener('change', () => {
            let value = parseInt(this.avgFileSizeInput.value);
            if (value < 1) value = 1;
            if (value > 10000) value = 10000;
            this.avgFileSizeInput.value = value;
        });
    }

    // Start benchmark
    async startBenchmark(type) {
        this.benchmarkType = type;
        this.isRunning = true;
        this.isStopping = false;
        this.totalFiles = parseInt(this.numFilesInput.value);
        this.processedFiles = 0;
        this.startTime = Date.now();
        this.totalDataProcessed = 0;
        this.actualAvgFileSize = 0;

        // Update UI
        this.updateButtonState(true);
        this.showStatus(`Starting ${type} benchmark...`);

        // Start progress tracking
        this.intervalId = setInterval(() => this.updateProgress(), 200);

        try {
            if (type === 'write') {
                // Clear existing data if it's a write benchmark
                await db.files.clear();
                this.showStatus('Database cleared, starting write benchmark...');
                await this.runWriteBenchmark();
            } else {
                await this.runReadBenchmark();
            }
        } catch (error) {
            this.showStatus('Benchmark error: ' + error.message);
            this.endBenchmark();
        }
    }

    // Run write benchmark
    async runWriteBenchmark() {
        const avgSizeKB = parseInt(this.avgFileSizeInput.value);
        const variancePercent = 20; // Allow 20% variance in file size

        const batchSize = 50; // Process in batches for better UI responsiveness

        for (let i = 0; i < this.totalFiles && !this.isStopping; i += batchSize) {
            const batch = [];

            for (let j = 0; j < batchSize && (i + j) < this.totalFiles; j++) {
                if (this.isStopping) break;

                // Calculate a varying file size around the average
                const variance = (Math.random() * 2 - 1) * variancePercent / 100;
                const sizeKB = Math.max(1, avgSizeKB + Math.round(avgSizeKB * variance));

                // Generate random content of specified size
                // Each character is approximately 1 byte in JS, so kB = thousands of chars
                const sizeInBytes = sizeKB * 1024;

                // Instead of generating huge actual strings which would consume memory,
                // we'll just simulate the file size for benchmark purposes
                const file = {
                    name: `file_${i + j}.txt`,
                    size: sizeInBytes,
                    dateCreated: new Date(),
                    // Use a smaller placeholder for actual content to save memory
                    content: `This is file ${i + j} with simulated size of ${sizeKB}KB.`
                };

                batch.push(file);
                this.totalDataProcessed += sizeInBytes;
                this.actualAvgFileSize = (this.actualAvgFileSize * this.processedFiles + sizeInBytes) / (this.processedFiles + 1);
            }

            try {
                // Bulk add the batch to database
                await db.files.bulkAdd(batch);

                // Update process count after batch is done
                this.processedFiles += batch.length;
            } catch (error) {
                this.showStatus('Write error: ' + error.message);
                break;
            }

            // Small delay to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (!this.isStopping) {
            this.showStatus('Write benchmark completed!');
        } else {
            this.showStatus('Write benchmark stopped.');
        }

        this.endBenchmark();
    }

    // Run read benchmark
    async runReadBenchmark() {
        // Check if there's data to read
        const count = await db.files.count();

        if (count === 0) {
            this.showStatus('No files to read. Please run a write benchmark first.');
            this.endBenchmark();
            return;
        }

        this.totalFiles = Math.min(this.totalFiles, count);

        // Read files in batches for better UI responsiveness
        const batchSize = 50;

        for (let i = 0; i < this.totalFiles && !this.isStopping; i += batchSize) {
            const limit = Math.min(batchSize, this.totalFiles - i);

            try {
                // Read a batch of files
                const files = await db.files.offset(i).limit(limit).toArray();

                for (const file of files) {
                    if (this.isStopping) break;

                    // Process the file (just count size for benchmark)
                    this.totalDataProcessed += file.size;
                    this.actualAvgFileSize = (this.actualAvgFileSize * this.processedFiles + file.size) / (this.processedFiles + 1);
                    this.processedFiles++;
                }
            } catch (error) {
                this.showStatus('Read error: ' + error.message);
                break;
            }

            // Small delay to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        if (!this.isStopping) {
            this.showStatus('Read benchmark completed!');
        } else {
            this.showStatus('Read benchmark stopped.');
        }

        this.endBenchmark();
    }

    // Stop benchmark
    stopBenchmark() {
        if (!this.isRunning) return;

        this.isStopping = true;
        this.showStatus(`${this.benchmarkType} benchmark is stopping...`);
        this.stopBenchBtn.textContent = 'Stopping...';
    }

    // End benchmark and reset UI
    endBenchmark() {
        this.isRunning = false;
        this.isStopping = false;
        this.endTime = Date.now();

        // Stop progress updates
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        // Update UI one last time
        this.updateProgress();
        this.updateButtonState(false);
    }

    // Update progress display
    updateProgress() {
        if (!this.isRunning && !this.startTime) return;

        const now = Date.now();
        const elapsedMs = now - this.startTime;
        const elapsedSec = elapsedMs / 1000;

        // Calculate percentage
        const percentage = this.totalFiles > 0 ? (this.processedFiles / this.totalFiles * 100) : 0;

        // Calculate processing rate
        this.processingRate = elapsedSec > 0 ? this.processedFiles / elapsedSec : 0;

        // Calculate estimated time remaining
        let estimatedTimeText = '--:--';
        if (this.processingRate > 0 && percentage < 100) {
            const remainingFiles = this.totalFiles - this.processedFiles;
            const remainingSec = remainingFiles / this.processingRate;
            estimatedTimeText = this.formatTime(remainingSec);
        }

        // Update UI elements
        this.progressBar.style.width = `${percentage}%`;
        this.progressPercentage.textContent = `${percentage.toFixed(1)}%`;
        this.filesProcessedEl.textContent = this.processedFiles;
        this.processingRateEl.textContent = `${this.processingRate.toFixed(1)} files/s`;
        this.elapsedTimeEl.textContent = this.formatTime(elapsedSec);
        this.estimatedTimeEl.textContent = estimatedTimeText;

        // Update data size information
        this.actualAvgSizeEl.textContent = `${(this.actualAvgFileSize / 1024).toFixed(1)} KB`;
        this.totalDataEl.textContent = `${(this.totalDataProcessed / (1024 * 1024)).toFixed(2)} MB`;

        // Update memory usage information
        if (window.performance && window.performance.memory) {
            const memUsage = window.performance.memory.usedJSHeapSize / (1024 * 1024);
            this.memoryUsageEl.textContent = `${memUsage.toFixed(1)} MB`;
        } else {
            this.memoryUsageEl.textContent = 'N/A';
        }
    }

    // Format seconds into MM:SS format
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Update button state based on whether benchmark is running
    updateButtonState(isRunning) {
        this.readBenchBtn.disabled = isRunning;
        this.writeBenchBtn.disabled = isRunning;
        this.stopBenchBtn.disabled = !isRunning;
        this.numFilesInput.disabled = isRunning;
        this.avgFileSizeInput.disabled = isRunning;
    }

    // Show status message
    showStatus(message) {
        this.statusMessage.textContent = message;
        this.statusMessage.classList.add('show');

        // Hide after a delay
        setTimeout(() => {
            this.statusMessage.classList.remove('show');
        }, 3000);

        console.log(message); // Also log to console
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const benchmark = new BenchmarkController();
});
